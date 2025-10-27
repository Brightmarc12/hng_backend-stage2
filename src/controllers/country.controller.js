// src/controllers/country.controller.js
const axios = require('axios');
const Country = require('../models/country.model');
const Metadata = require('../models/metadata.model');
const sequelize = require('../config/database'); // We need this for transactions
const { generateSummaryImage } = require('../services/image.service');

// A helper function to get a random multiplier for GDP calculation
const getRandomMultiplier = () => Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;

exports.refreshCountries = async (req, res) => {
  // Use a transaction to ensure that if any part of the refresh fails,
  // the database is rolled back to its original state.
  const t = await sequelize.transaction();

  try {
    console.log('🔄 Starting country data refresh...');

    // --- 1. Fetch data from external APIs ---
    // We run these in parallel to save time.
    console.log('Fetching data from external APIs...');
    const [countriesResponse, ratesResponse] = await Promise.all([
      axios.get('https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies', { timeout: 10000 }),
      axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 10000 })
    ]).catch(error => {
      // If either API fails, we throw a custom error to be caught below.
      const apiName = error.config.url.includes('restcountries') ? 'RestCountries' : 'ExchangeRate-API';
      throw { status: 503, message: `Could not fetch data from ${apiName}` };
    });

    const countriesData = countriesResponse.data;
    const exchangeRates = ratesResponse.data.rates;
    console.log(`✅ Fetched ${countriesData.length} countries and ${Object.keys(exchangeRates).length} exchange rates.`);

    // --- 2. Process and Upsert each country ---
    console.log('Processing and saving country data...');
    for (const countryData of countriesData) {
      // --- Handle Currency ---
      const currency = countryData.currencies ? countryData.currencies[0] : null;
      const currencyCode = currency ? currency.code : null;
      // Find the exchange rate. It's null if the currency code doesn't exist in the rates object.
      const exchangeRate = currencyCode ? exchangeRates[currencyCode] : null;

      // --- Handle GDP ---
      let estimatedGdp = null;
      // We can only calculate GDP if we have a population AND a valid exchange rate.
      if (countryData.population && exchangeRate) {
        // As per the formula: population * random(1000–2000) / exchange_rate
        estimatedGdp = (countryData.population * getRandomMultiplier()) / exchangeRate;
      }
      
      // --- Prepare data record for the database ---
      // This object matches our Sequelize model structure.
      const countryRecord = {
        name: countryData.name,
        capital: countryData.capital,
        region: countryData.region,
        population: countryData.population,
        currency_code: currencyCode,
        exchange_rate: exchangeRate,
        estimated_gdp: estimatedGdp,
        flag_url: countryData.flag
      };
      
      // --- Upsert Logic ---
      // Find a country by its name. If it exists, update it. If not, create it.
      // This is all done within the transaction.
      await Country.upsert(countryRecord, { transaction: t });
    }
    console.log('✅ All countries processed and saved.');

    // --- 3. Update the global refresh timestamp ---
    const refreshTimestamp = new Date();
    await Metadata.update({ last_refreshed_at: refreshTimestamp }, { where: { id: 1 }, transaction: t });
    console.log(`✅ Global refresh timestamp updated to: ${refreshTimestamp.toISOString()}`);

    // --- 4. Commit the transaction ---
    // If we get here, everything was successful, so we commit the changes to the database.
    await t.commit();
    console.log('✅ Transaction committed successfully.');
    
    // --- 5. Trigger image generation (asynchronously) ---
    // We call this AFTER the transaction is committed. We don't wait for it to finish
    // before sending the response to the user, making the endpoint faster.
    generateSummaryImage();

    res.status(200).json({ 
      message: 'Country data refreshed and cached successfully. Image generation started.',
      countries_processed: countriesData.length
    });

  } catch (error) {
    // --- Error Handling ---
    // If anything went wrong, we roll back the transaction.
    await t.rollback();

    // If it was our custom API error, use its status and message.
    if (error.status === 503) {
      console.error(`❌ API Error: ${error.message}`);
      return res.status(503).json({ error: "External data source unavailable", details: error.message });
    }

    // Otherwise, it's an unexpected internal error.
    console.error('❌ An unexpected error occurred during the refresh:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- GET /countries ---
exports.getAllCountries = async (req, res) => {
  try {
    const { region, currency, sort } = req.query;

    // Build the query options for Sequelize
    const options = {
      where: {},
      order: []
    };

    // --- Filtering ---
    if (region) {
      options.where.region = region;
    }
    if (currency) {
      options.where.currency_code = currency;
    }

    // --- Sorting ---
    if (sort) {
      // Example: sort=gdp_desc -> order by estimated_gdp DESC
      const [field, order] = sort.split('_');
      if (field === 'gdp' && (order === 'asc' || order === 'desc')) {
        options.order.push(['estimated_gdp', order.toUpperCase()]);
      }
    }

    const countries = await Country.findAll(options);

// Manually parse DECIMAL fields to floats for the JSON response
    const formattedCountries = countries.map(country => {
        const plainCountry = country.get({ plain: true });
        return {
            ...plainCountry,
            exchange_rate: plainCountry.exchange_rate ? parseFloat(plainCountry.exchange_rate) : null,
            estimated_gdp: plainCountry.estimated_gdp ? parseFloat(plainCountry.estimated_gdp) : null
        };
    });

    res.status(200).json(formattedCountries);

  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- GET /countries/:name ---
exports.getCountryByName = async (req, res) => {
  try {
    const { name } = req.params;
    const country = await Country.findOne({
      // Use case-insensitive matching for the name
      where: { name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + name.toLowerCase() + '%') }
    });

    if (!country) {
        return res.status(404).json({ error: 'Country not found' });
      }
      
      // Manually parse DECIMAL fields
    const plainCountry = country.get({ plain: true });
    const formattedCountry = {
        ...plainCountry,
        exchange_rate: plainCountry.exchange_rate ? parseFloat(plainCountry.exchange_rate) : null,
        estimated_gdp: plainCountry.estimated_gdp ? parseFloat(plainCountry.estimated_gdp) : null
      };
      
    res.status(200).json(formattedCountry);

  } catch (error) {
    console.error('Error fetching country by name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- DELETE /countries/:name ---
exports.deleteCountryByName = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await Country.destroy({
      where: { name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + name.toLowerCase() + '%') }
    });

    if (result === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }

    // HTTP 204 No Content is a standard success response for DELETE
    res.status(204).send();

  } catch (error) {
    console.error('Error deleting country by name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- GET /status ---
exports.getStatus = async (req, res) => {
  try {
    const totalCountries = await Country.count();
    const metadata = await Metadata.findByPk(1); // We know our single row has id=1

    if (!metadata) {
       // This is a fallback in case the metadata row is missing
      return res.status(404).json({ error: 'Status information not available. Please run a refresh.' });
    }

    res.status(200).json({
      total_countries: totalCountries,
      last_refreshed_at: metadata.last_refreshed_at
    });

  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const path = require('path');
const fs = require('fs');

exports.serveSummaryImage = (req, res) => {
  const imagePath = path.join(__dirname, '..', '..', 'cache', 'summary.png');

  // Check if the file exists
  if (fs.existsSync(imagePath)) {
    // The 'sendFile' method handles setting the correct Content-Type header
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ error: 'Summary image not found. Please run a refresh first.' });
  }
};