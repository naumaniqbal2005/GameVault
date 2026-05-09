// Initialize configuration by loading environment variables from the .env file
require('dotenv').config();

// Import library mssql
const sql = require('mssql');

// Debug: Log environment variables to verify they are loaded correctly (development only)
console.log('Environment variables loaded:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD?.length);
console.log('DB_PASSWORD:', JSON.stringify(process.env.DB_PASSWORD));

// Build SQL Server connection config object
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: 'localhost',
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    instanceName: 'SQLEXPRESS',
    trustServerCertificate: true,
    encrypt: false
  }
};

// Create a connection pool using the config object
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL successfully');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed!', err);
    throw err;
  });

// Export sql object and poolPromise so other files can use them
module.exports = { sql, poolPromise };