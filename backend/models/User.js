const { poolPromise } = require('../config/db');

class User {
    static async create(userData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('UserID', require('mssql').Int, userData.UserID)
                .input('FullName', require('mssql').VarChar(50), userData.FullName)
                .input('Email', require('mssql').VarChar(100), userData.Email)
                .input('AccountStatus', require('mssql').VarChar(20), userData.AccountStatus || 'Active')
                .query(`
                    INSERT INTO Users (UserID, FullName, Email, AccountStatus)
                    VALUES (@UserID, @FullName, @Email, @AccountStatus)
                    SELECT SCOPE_IDENTITY() as UserID
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findById(userId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('UserID', require('mssql').Int, userId)
                .query('SELECT * FROM Users WHERE UserID = @UserID');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('Email', require('mssql').VarChar(100), email)
                .query('SELECT * FROM Users WHERE Email = @Email');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async update(userId, userData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('UserID', require('mssql').Int, userId)
                .input('FullName', require('mssql').VarChar(50), userData.FullName)
                .input('Email', require('mssql').VarChar(100), userData.Email)
                .input('AccountStatus', require('mssql').VarChar(20), userData.AccountStatus)
                .query(`
                    UPDATE Users 
                    SET FullName = @FullName, Email = @Email, AccountStatus = @AccountStatus
                    WHERE UserID = @UserID
                `);
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query('SELECT * FROM Users ORDER BY FullName');
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async delete(userId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('UserID', require('mssql').Int, userId)
                .query('DELETE FROM Users WHERE UserID = @UserID');
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;
