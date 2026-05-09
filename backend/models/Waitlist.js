const { poolPromise } = require('../config/db');

class Waitlist {
    static async addToDigitalWaitlist(waitlistData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('WaitlistID', require('mssql').Int, waitlistData.WaitlistID)
                .input('UserID', require('mssql').Int, waitlistData.UserID)
                .input('GameID', require('mssql').Int, waitlistData.GameID)
                .input('RequestTime', require('mssql').DateTime, waitlistData.RequestTime || new Date())
                .query(`
                    INSERT INTO DigitalWaitlist (WaitlistID, UserID, GameID, RequestTime)
                    VALUES (@WaitlistID, @UserID, @GameID, @RequestTime)
                    SELECT SCOPE_IDENTITY() as WaitlistID
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async addToPhysicalWaitlist(waitlistData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('WaitlistID', require('mssql').Int, waitlistData.WaitlistID)
                .input('UserID', require('mssql').Int, waitlistData.UserID)
                .input('GameID', require('mssql').Int, waitlistData.GameID)
                .input('RequestTime', require('mssql').DateTime, waitlistData.RequestTime || new Date())
                .query(`
                    INSERT INTO PhysicalWaitlist (WaitlistID, UserID, GameID, RequestTime)
                    VALUES (@WaitlistID, @UserID, @GameID, @RequestTime)
                    SELECT SCOPE_IDENTITY() as WaitlistID
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async getDigitalWaitlist(gameId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('GameID', require('mssql').Int, gameId)
                .query(`
                    SELECT dw.*, u.FullName, u.Email
                    FROM DigitalWaitlist dw
                    JOIN Users u ON dw.UserID = u.UserID
                    WHERE dw.GameID = @GameID
                    ORDER BY dw.RequestTime ASC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async getPhysicalWaitlist(gameId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('GameID', require('mssql').Int, gameId)
                .query(`
                    SELECT pw.*, u.FullName, u.Email
                    FROM PhysicalWaitlist pw
                    JOIN Users u ON pw.UserID = u.UserID
                    WHERE pw.GameID = @GameID
                    ORDER BY pw.RequestTime ASC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async getUserDigitalWaitlist(userId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('UserID', require('mssql').Int, userId)
                .query(`
                    SELECT dw.*, g.GameTitle
                    FROM DigitalWaitlist dw
                    JOIN Games g ON dw.GameID = g.GameID
                    WHERE dw.UserID = @UserID
                    ORDER BY dw.RequestTime ASC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async getUserPhysicalWaitlist(userId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('UserID', require('mssql').Int, userId)
                .query(`
                    SELECT pw.*, g.GameTitle
                    FROM PhysicalWaitlist pw
                    JOIN Games g ON pw.GameID = g.GameID
                    WHERE pw.UserID = @UserID
                    ORDER BY pw.RequestTime ASC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async removeFromDigitalWaitlist(waitlistId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('WaitlistID', require('mssql').Int, waitlistId)
                .query('DELETE FROM DigitalWaitlist WHERE WaitlistID = @WaitlistID');
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }

    static async removeFromPhysicalWaitlist(waitlistId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('WaitlistID', require('mssql').Int, waitlistId)
                .query('DELETE FROM PhysicalWaitlist WHERE WaitlistID = @WaitlistID');
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }

    static async isUserOnDigitalWaitlist(userId, gameId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('UserID', require('mssql').Int, userId)
                .input('GameID', require('mssql').Int, gameId)
                .query('SELECT * FROM DigitalWaitlist WHERE UserID = @UserID AND GameID = @GameID');
            return result.recordset.length > 0;
        } catch (error) {
            throw error;
        }
    }

    static async isUserOnPhysicalWaitlist(userId, gameId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('UserID', require('mssql').Int, userId)
                .input('GameID', require('mssql').Int, gameId)
                .query('SELECT * FROM PhysicalWaitlist WHERE UserID = @UserID AND GameID = @GameID');
            return result.recordset.length > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getAllWaitlists() {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query(`
                    SELECT dw.WaitlistID, dw.UserID, u.FullName, dw.GameID, g.GameTitle, dw.RequestTime, 'Digital' AS WaitlistType
                    FROM DigitalWaitlist dw
                    JOIN Users u ON dw.UserID = u.UserID
                    JOIN Games g ON dw.GameID = g.GameID
                    UNION
                    SELECT pw.WaitlistID, pw.UserID, u.FullName, pw.GameID, g.GameTitle, pw.RequestTime, 'Physical' AS WaitlistType
                    FROM PhysicalWaitlist pw
                    JOIN Users u ON pw.UserID = u.UserID
                    JOIN Games g ON pw.GameID = g.GameID
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Waitlist;
