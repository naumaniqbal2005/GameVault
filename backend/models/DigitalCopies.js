const { poolPromise } = require('../config/db');

class DigitalCopy {
    static async create(copyData) {
        try {
            const pool = await poolPromise;
            
            // Generate a unique CopyID
            const maxIdResult = await pool.request().query(`
                SELECT ISNULL(MAX(CopyID), 0) as MaxId FROM DigitalCopies
            `);
            const newCopyId = maxIdResult.recordset[0].MaxId + 1;
            
            const result = await pool.request()
                .input('CopyID', require('mssql').Int, newCopyId)
                .input('GameID', require('mssql').Int, copyData.GameID)
                .input('Availability', require('mssql').VarChar(20), copyData.Availability)
                .query(`
                    INSERT INTO DigitalCopies (CopyID, GameID, Availability)
                    VALUES (@CopyID, @GameID, @Availability)
                `);
            
            return { CopyID: newCopyId };
        } catch (error) {
            throw error;
        }
    }

    static async findByGameId(gameId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('GameID', require('mssql').Int, gameId)
                .query(`
                    SELECT * FROM DigitalCopies 
                    WHERE GameID = @GameID
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async findAvailable(gameId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('GameID', require('mssql').Int, gameId)
                .query(`
                    SELECT * FROM DigitalCopies 
                    WHERE GameID = @GameID AND Availability = 'Available'
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = DigitalCopy;
