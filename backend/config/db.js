// Initialize configuration by loading environment variables from the .env file
require('dotenv').config();

// Import library mssql
const sql = require('mssql');
// Debug: Log environment variables to verify they are loaded correctly (development only)
console.log('Environment variables loaded:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_NAME:', process.env.DB_NAME);

// Build SQL Server connection string; TrustServerCertificate=true bypasses SSL validation (for local development only)
const connectionString = `Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};User Id=${process.env.DB_USER};Password=${process.env.DB_PASSWORD};TrustServerCertificate=true;`;

// Create a connection pool using the connection string
// poolPromise will either resolve with a connected pool or throw an error
const poolPromise = new sql.ConnectionPool(connectionString)
  .connect()
  .then(pool => {
   // Log a confirmation message if the connection is successful
    console.log('Connected to MSSQL successfully');
    return pool;
  })
  .catch(err => {
    // If connection fails, log error details
    console.error('Database Connection Failed!', err);

// Mask the password when logging the connection string to protect sensitive information
    console.error('Connection String:', connectionString.replace(/Password=[^;]+/, 'Password=[REDACTED]'));
    
    // Provide specific hints if login fails
    if (err.code === 'ELOGIN') {
      console.error('Login failed. Possible causes:');
      console.error('1. SQL Server Authentication not enabled');
      console.error('2. sa account disabled');
      console.error('3. Password incorrect');
      console.error('4. Database does not exist');
    }

    // Rethrow error so calling code knows connection failed
    throw err;
  });

// Export sql object and poolPromise so other files can use them
module.exports = { sql, poolPromise };
