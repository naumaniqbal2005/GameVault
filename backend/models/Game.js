const { poolPromise } = require('../config/db');

class Game {
    static async create(gameData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('GameID', require('mssql').Int, gameData.GameID)
                .input('GameTitle', require('mssql').VarChar(100), gameData.GameTitle)
                .input('Platform', require('mssql').VarChar(50), gameData.Platform)
                .input('Genre', require('mssql').VarChar(50), gameData.Genre)
                .input('CategoryID', require('mssql').Int, gameData.CategoryID)
                .input('PhysicalPrice', require('mssql').Decimal(10, 2), gameData.PhysicalPrice)
                .input('DigitalRentalPrice', require('mssql').Decimal(10, 2), gameData.DigitalRentalPrice)
                .query(`
                    INSERT INTO Games (GameID, GameTitle, Platform, Genre, CategoryID, PhysicalPrice, DigitalRentalPrice)
                    VALUES (@GameID, @GameTitle, @Platform, @Genre, @CategoryID, @PhysicalPrice, @DigitalRentalPrice)
                    SELECT SCOPE_IDENTITY() as GameID
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findById(gameId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('GameID', require('mssql').Int, gameId)
                .query(`
                    SELECT g.*, c.CategoryName 
                    FROM Games g 
                    LEFT JOIN Categories c ON g.CategoryID = c.CategoryID 
                    WHERE g.GameID = @GameID
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async getAll(filters = {}) {
        try {
            const pool = await poolPromise;
            let query = `
                SELECT g.*, c.CategoryName 
                FROM Games g 
                LEFT JOIN Categories c ON g.CategoryID = c.CategoryID
                WHERE 1=1
            `;
            
            const request = pool.request();
            
            if (filters.category) {
                query += ' AND g.CategoryID = @CategoryID';
                request.input('CategoryID', require('mssql').Int, filters.category);
            }
            
            if (filters.platform) {
                query += ' AND g.Platform LIKE @Platform';
                request.input('Platform', require('mssql').VarChar(50), `%${filters.platform}%`);
            }
            
            if (filters.genre) {
                query += ' AND g.Genre LIKE @Genre';
                request.input('Genre', require('mssql').VarChar(50), `%${filters.genre}%`);
            }
            
            if (filters.search) {
                query += ' AND g.GameTitle LIKE @Search';
                request.input('Search', require('mssql').VarChar(100), `%${filters.search}%`);
            }
            
            query += ' ORDER BY g.GameTitle';
            
            const result = await request.query(query);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async update(gameId, gameData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('GameID', require('mssql').Int, gameId)
                .input('GameTitle', require('mssql').VarChar(100), gameData.GameTitle)
                .input('Platform', require('mssql').VarChar(50), gameData.Platform)
                .input('Genre', require('mssql').VarChar(50), gameData.Genre)
                .input('CategoryID', require('mssql').Int, gameData.CategoryID)
                .input('PhysicalPrice', require('mssql').Decimal(10, 2), gameData.PhysicalPrice)
                .input('DigitalRentalPrice', require('mssql').Decimal(10, 2), gameData.DigitalRentalPrice)
                .query(`
                    UPDATE Games 
                    SET GameTitle = @GameTitle, Platform = @Platform, Genre = @Genre, 
                        CategoryID = @CategoryID, PhysicalPrice = @PhysicalPrice, 
                        DigitalRentalPrice = @DigitalRentalPrice
                    WHERE GameID = @GameID
                `);
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(gameId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('GameID', require('mssql').Int, gameId)
                .query('DELETE FROM Games WHERE GameID = @GameID');
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getAvailablePhysicalCopiesByCopyId(copyId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('CopyID', require('mssql').Int, copyId)
                .query(`
                    SELECT pc.*, g.GameTitle, g.Platform, g.Genre, g.PhysicalPrice
                    FROM PhysicalCopies pc
                    JOIN Games g ON pc.GameID = g.GameID
                    WHERE pc.CopyID = @CopyID AND pc.Availability = 'Available'
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async getAvailablePhysicalCopies(gameId) {
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

    static async getAvailableDigitalCopiesByCopyId(copyId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('CopyID', require('mssql').Int, copyId)
                .query(`
                    SELECT dc.*, g.GameTitle, g.Platform, g.Genre
                    FROM DigitalCopies dc
                    JOIN Games g ON dc.GameID = g.GameID
                    WHERE dc.CopyID = @CopyID AND dc.Availability = 'Available'
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async getAvailableDigitalCopies(gameId) {
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

module.exports = Game;
