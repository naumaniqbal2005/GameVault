const { poolPromise } = require('../config/db');

class Admin {
    static async create(adminData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('AdminID', require('mssql').Int, adminData.AdminID)
                .input('FullName', require('mssql').VarChar(50), adminData.FullName)
                .input('Email', require('mssql').VarChar(100), adminData.Email)
                .input('AccessLevel', require('mssql').VarChar(20), adminData.AccessLevel || 'Standard')
                .query(`
                    INSERT INTO Admins (AdminID, FullName, Email, AccessLevel)
                    VALUES (@AdminID, @FullName, @Email, @AccessLevel)
                    SELECT SCOPE_IDENTITY() as AdminID
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findById(adminId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('AdminID', require('mssql').Int, adminId)
                .query('SELECT * FROM Admins WHERE AdminID = @AdminID');
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
                .query('SELECT * FROM Admins WHERE Email = @Email');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query('SELECT * FROM Admins ORDER BY FullName');
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async update(adminId, adminData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('AdminID', require('mssql').Int, adminId)
                .input('FullName', require('mssql').VarChar(50), adminData.FullName)
                .input('Email', require('mssql').VarChar(100), adminData.Email)
                .input('AccessLevel', require('mssql').VarChar(20), adminData.AccessLevel)
                .query(`
                    UPDATE Admins 
                    SET FullName = @FullName, Email = @Email, AccessLevel = @AccessLevel
                    WHERE AdminID = @AdminID
                `);
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(adminId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('AdminID', require('mssql').Int, adminId)
                .query('DELETE FROM Admins WHERE AdminID = @AdminID');
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Admin;
