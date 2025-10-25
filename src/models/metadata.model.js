// src/models/metadata.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Metadata = sequelize.define('Metadata', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1 // We will only ever have one row
  },
  last_refreshed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: false // We don't need createdAt or updatedAt for this table
});

module.exports = Metadata;