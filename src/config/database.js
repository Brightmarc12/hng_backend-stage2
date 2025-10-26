// src/config/database.js

const { Sequelize } = require('sequelize');

let sequelize;

// This is the new, smarter logic.
if (process.env.DATABASE_URL) {
    // Use the connection URL if it's available (this is for Railway)
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            // It's good practice to require SSL on production databases
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} else {
    // Otherwise, use the individual variables from our .env file for local development
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'mysql',
            logging: false
        }
    );
}

module.exports = sequelize;