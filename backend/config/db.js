// Load environment variables from .env file
require('dotenv').config();

// Import MSSQL library
const sql = require('mssql');

// Log environment variables to confirm they are loaded correctly
console.log('Environment variables loaded:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_NAME:', process.env.DB_NAME);

// Build connection string for SQL Server
// TrustServerCertificate=true is used to bypass SSL certificate validation (common in local dev)
const connectionString = `Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};User Id=${process.env.DB_USER};Password=${process.env.DB_PASSWORD};TrustServerCertificate=true;`;

// Create a connection pool using the connection string
// poolPromise will either resolve with a connected pool or throw an error
const poolPromise = new sql.ConnectionPool(connectionString)
  .connect()
  .then(pool => {
    // If connection succeeds, log confirmation
    console.log('Connected to MSSQL successfully');
    return pool;
  })
  .catch(err => {
    // If connection fails, log error details
    console.error('Database Connection Failed!', err);

    // Hide the actual password when printing the connection string for security
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
