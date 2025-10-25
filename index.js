// index.js
require('dotenv').config();
const express = require('express');
const sequelize = require('./src/config/database');

// Import models to ensure they are registered with Sequelize
const Country = require('./src/models/country.model');
const Metadata = require('./src/models/metadata.model');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// --- Import and Use Routes ---
const countryRoutes = require('./src/routes/country.routes');
app.use('/api', countryRoutes); // We'll prefix all our routes with /api for good practice

// A simple test route
app.get('/', (req, res) => {
  res.send('API is running...');
});



// --- Database Connection and Server Start ---
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    // Sync all models with the database
    // Use { force: true } to drop and re-create tables on every start (for development)
    // Use { alter: true } to update tables to match the model (safer for development)
    await sequelize.sync({ alter: true });
    console.log('✅ All models were synchronized successfully.');
    
    // Ensure the single metadata row exists
    await Metadata.findOrCreate({ where: { id: 1 } });
    console.log('✅ Metadata row checked/created.');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Unable to connect to the database or start the server:', error);
  }
};

startServer();