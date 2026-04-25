const { poolPromise } = require('../config/db');

class PhysicalCopy {
    static async create(copyData) {
        try {
            const pool = await poolPromise;
            
            // Generate a unique CopyID
            const maxIdResult = await pool.request().query(`
                SELECT ISNULL(MAX(CopyID), 0) as MaxId FROM PhysicalCopies
            `);
            const newCopyId = maxIdResult.recordset[0].MaxId + 1;
            
            const result = await pool.request()
                .input('CopyID', require('mssql').Int, newCopyId)
                .input('GameID', require('mssql').Int, copyData.GameID)
                .input('CopyCondition', require('mssql').VarChar(20), copyData.CopyCondition)
                .input('Availability', require('mssql').VarChar(20), copyData.Availability)
                .query(`
                    INSERT INTO PhysicalCopies (CopyID, GameID, CopyCondition, Availability)
                    VALUES (@CopyID, @GameID, @CopyCondition, @Availability)
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
                    SELECT * FROM PhysicalCopies 
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
                    SELECT * FROM PhysicalCopies 
                    WHERE GameID = @GameID AND Availability = 'Available'
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = PhysicalCopy;
