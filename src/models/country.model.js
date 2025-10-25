// src/models/country.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Country = sequelize.define('Country', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  capital: {
    type: DataTypes.STRING,
    allowNull: true
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true
  },
  population: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  currency_code: {
    type: DataTypes.STRING(10), // Set a reasonable length
    allowNull: true
  },
  exchange_rate: {
    type: DataTypes.DECIMAL(20, 6),
    allowNull: true
  },
  estimated_gdp: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true
  },
  flag_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  updatedAt: 'last_refrefreshed_at', // Map Sequelize's updatedAt to our desired column name
  createdAt: false // We don't need a createdAt column
});

module.exports = Country;