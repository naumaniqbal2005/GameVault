const { poolPromise } = require('./config/db');
const sql = require('mssql');
const DigitalCopy = require('./models/DigitalCopies');
const PhysicalCopy = require('./models/PhysicalCopies');

async function checkTables() {
  try {
    const pool = await poolPromise;
    console.log('Database connected successfully');
    
    // Test creating a digital copy using the model
    console.log('\nTesting digital copy creation with model...');
    try {
      const digitalResult = await DigitalCopy.create({
        GameID: 721395,
        Availability: 'Available'
      });
      console.log('Digital copy created successfully:', digitalResult);
    } catch (error) {
      console.error('Digital copy creation failed:', error.message);
    }
    
    // Test creating a physical copy using the model
    console.log('\nTesting physical copy creation with model...');
    try {
      const physicalResult = await PhysicalCopy.create({
        GameID: 721395,
        CopyCondition: 'Good',
        Availability: 'Available'
      });
      console.log('Physical copy created successfully:', physicalResult);
    } catch (error) {
      console.error('Physical copy creation failed:', error.message);
    }
    
    // Check existing copies
    console.log('\nChecking existing copies for Test Game...');
    const digitalCopies = await DigitalCopy.findByGameId(721395);
    console.log('Digital copies for Test Game:', digitalCopies);
    
    const physicalCopies = await PhysicalCopy.findByGameId(721395);
    console.log('Physical copies for Test Game:', physicalCopies);
    
  } catch (error) {
    console.error('Database error:', error.message);
    console.error('Full error:', error);
  }
}

checkTables();
