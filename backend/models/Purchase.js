const { poolPromise } = require('../config/db');

class Purchase {
    static async create(purchaseData) {
        try {
            const pool = await poolPromise;
            const transaction = pool.transaction();
            
            await transaction.begin();
            
            try {
                // Create purchase record
                const purchaseResult = await transaction.request()
                    .input('PurchaseID', require('mssql').Int, purchaseData.PurchaseID)
                    .input('UserID', require('mssql').Int, purchaseData.UserID)
                    .input('CopyID', require('mssql').Int, purchaseData.CopyID)
                    .input('AdminID', require('mssql').Int, purchaseData.AdminID)
                    .input('PurchaseDate', require('mssql').Date, purchaseData.PurchaseDate)
                    .query(`
                        INSERT INTO Purchases (PurchaseID, UserID, CopyID, AdminID, PurchaseDate)
                        VALUES (@PurchaseID, @UserID, @CopyID, @AdminID, @PurchaseDate)
                        SELECT SCOPE_IDENTITY() as PurchaseID
                    `);

                // Update physical copy availability
                await transaction.request()
                    .input('CopyID', require('mssql').Int, purchaseData.CopyID)
                    .query(`
                        UPDATE PhysicalCopies 
                        SET Availability = 'Sold'
                        WHERE CopyID = @CopyID
                    `);

                await transaction.commit();
                return purchaseResult.recordset[0];
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }

    static async findById(purchaseId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('PurchaseID', require('mssql').Int, purchaseId)
                .query(`
                    SELECT p.*, u.FullName as UserName, a.FullName as AdminName, 
                           g.GameTitle, pc.CopyCondition
                    FROM Purchases p
                    JOIN Users u ON p.UserID = u.UserID
                    JOIN Admins a ON p.AdminID = a.AdminID
                    JOIN PhysicalCopies pc ON p.CopyID = pc.CopyID
                    JOIN Games g ON pc.GameID = g.GameID
                    WHERE p.PurchaseID = @PurchaseID
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('UserID', require('mssql').Int, userId)
                .query(`
                    SELECT p.*, g.GameTitle, pc.CopyCondition, pc.CopyID
                    FROM Purchases p
                    JOIN PhysicalCopies pc ON p.CopyID = pc.CopyID
                    JOIN Games g ON pc.GameID = g.GameID
                    WHERE p.UserID = @UserID
                    ORDER BY p.PurchaseDate DESC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query(`
                    SELECT p.*, u.FullName as UserName, g.GameTitle, pc.CopyCondition
                    FROM Purchases p
                    JOIN Users u ON p.UserID = u.UserID
                    JOIN PhysicalCopies pc ON p.CopyID = pc.CopyID
                    JOIN Games g ON pc.GameID = g.GameID
                    ORDER BY p.PurchaseDate DESC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Purchase;
