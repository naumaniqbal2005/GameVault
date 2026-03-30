const { poolPromise } = require('../config/db');

class Category {
    static async create(categoryData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('CategoryID', require('mssql').Int, categoryData.CategoryID)
                .input('CategoryName', require('mssql').VarChar(50), categoryData.CategoryName)
                .query(`
                    INSERT INTO Categories (CategoryID, CategoryName)
                    VALUES (@CategoryID, @CategoryName)
                    SELECT SCOPE_IDENTITY() as CategoryID
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findById(categoryId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('CategoryID', require('mssql').Int, categoryId)
                .query('SELECT * FROM Categories WHERE CategoryID = @CategoryID');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query('SELECT * FROM Categories ORDER BY CategoryName');
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async update(categoryId, categoryData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('CategoryID', require('mssql').Int, categoryId)
                .input('CategoryName', require('mssql').VarChar(50), categoryData.CategoryName)
                .query(`
                    UPDATE Categories 
                    SET CategoryName = @CategoryName
                    WHERE CategoryID = @CategoryID
                `);
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(categoryId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('CategoryID', require('mssql').Int, categoryId)
                .query('DELETE FROM Categories WHERE CategoryID = @CategoryID');
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Category;
