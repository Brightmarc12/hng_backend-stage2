// src/services/image.service.js
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const Country = require('../models/country.model');
const Metadata = require('../models/metadata.model');

// Helper function to format large numbers with commas
const formatNumber = (num) => {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const generateSummaryImage = async () => {
  try {
    console.log('🖼️ Starting summary image generation...');

    // 1. Fetch data from the database
    const totalCountries = await Country.count();
    const top5Countries = await Country.findAll({
      order: [['estimated_gdp', 'DESC']],
      limit: 5
    });
    const metadata = await Metadata.findByPk(1);
    const lastRefreshed = metadata ? new Date(metadata.last_refreshed_at).toUTCString() : 'N/A';

    // 2. Create an SVG with an embedded font to ensure it renders correctly anywhere.
    // This long Base64 string is the data for the "Inter" font.
    const svg = `
  <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
    <style>
      .container { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      .title { font-size: 32px; font-weight: 600; fill: #ffffff; }
      .subtitle { font-size: 20px; font-weight: 400; fill: #bbbbbb; }
      .country-name { font-size: 18px; fill: #dddddd; }
      .country-gdp { font-size: 18px; font-weight: 600; fill: #82e0aa; text-align: right; }
    </style>
    <rect width="100%" height="100%" fill="#1C2833" />
    <g class="container" transform="translate(30, 50)">
      <text class="title">Countries API Summary</text>
      <text y="30" class="subtitle">Total Countries in DB: ${totalCountries}</text>
      
      <text y="80" class="subtitle">Top 5 Countries by Estimated GDP (USD):</text>
      ${top5Countries.map((country, index) => `
        <text x="0" y="${115 + index * 30}" class="country-name">${index + 1}. ${country.name}</text>
        <text x="740" y="${115 + index * 30}" class="country-gdp" text-anchor="end">$${formatNumber(country.estimated_gdp)}</text>
      `).join('')}

      <text y="320" class="subtitle">Last Refreshed: ${lastRefreshed}</text>
    </g>
  </svg>
`;

    // 3. Use Sharp to convert the SVG to a PNG and save it
    const imageBuffer = Buffer.from(svg);
    const cacheDir = path.join(__dirname, '..', '..', 'cache');

    // Ensure the cache directory exists
    await fs.mkdir(cacheDir, { recursive: true });

    const imagePath = path.join(cacheDir, 'summary.png');
    await sharp(imageBuffer)
      .png()
      .toFile(imagePath);

    console.log(`✅ Summary image saved to ${imagePath}`);
  } catch (error) {
    console.error('❌ Error generating summary image:', error);
  }
};

module.exports = { generateSummaryImage };