require('dotenv').config();
const sql = require('mssql');

console.log('Environment variables loaded:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_NAME:', process.env.DB_NAME);

// Try connection string format
const connectionString = `Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};User Id=${process.env.DB_USER};Password=${process.env.DB_PASSWORD};TrustServerCertificate=true;`;

const poolPromise = new sql.ConnectionPool(connectionString)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL successfully');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed!', err);
    console.error('Connection String:', connectionString.replace(/Password=[^;]+/, 'Password=[REDACTED]'));
    
    if (err.code === 'ELOGIN') {
      console.error('Login failed. Possible causes:');
      console.error('1. SQL Server Authentication not enabled');
      console.error('2. sa account disabled');
      console.error('3. Password incorrect');
      console.error('4. Database does not exist');
    }
    throw err;
  });


module.exports = { sql, poolPromise };
