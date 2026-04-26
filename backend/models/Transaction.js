const { poolPromise } = require('../config/db');

class Transaction {
    static async create(transactionData) {
        try {
            console.log('Transaction.create called with:', transactionData); // Debug log
            const pool = await poolPromise;
            const request = pool.request()
                .input('TransactionID', require('mssql').Int, transactionData.TransactionID)
                .input('UserID', require('mssql').Int, transactionData.UserID)
                .input('AdminID', require('mssql').Int, transactionData.AdminID)
                .input('Amount', require('mssql').Decimal(10, 2), transactionData.Amount)
                .input('TransactionDate', require('mssql').Date, transactionData.TransactionDate || new Date())
                .input('DiscountApplied', require('mssql').Decimal(5, 2), transactionData.DiscountApplied || 0.00);

            // Handle optional RentalID and PurchaseID
            if (transactionData.RentalID && transactionData.RentalID !== null) {
                request.input('RentalID', require('mssql').Int, transactionData.RentalID);
            } else {
                request.input('RentalID', require('mssql').Int, null);
            }

            if (transactionData.PurchaseID && transactionData.PurchaseID !== null) {
                request.input('PurchaseID', require('mssql').Int, transactionData.PurchaseID);
            } else {
                request.input('PurchaseID', require('mssql').Int, null);
            }

            const result = await request.query(`
                INSERT INTO Transactions (TransactionID, UserID, RentalID, PurchaseID, AdminID, Amount, TransactionDate, DiscountApplied)
                VALUES (@TransactionID, @UserID, @RentalID, @PurchaseID, @AdminID, @Amount, @TransactionDate, @DiscountApplied)
                SELECT SCOPE_IDENTITY() as TransactionID
            `);
            console.log('Transaction inserted successfully'); // Debug log
            return result.recordset[0];
        } catch (error) {
            console.error('Transaction.create error:', error); // Debug log
            throw error;
        }
    }

    static async findById(transactionId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('TransactionID', require('mssql').Int, transactionId)
                .query(`
                    SELECT t.*, u.FullName as UserName, a.FullName as AdminName
                    FROM Transactions t
                    JOIN Users u ON t.UserID = u.UserID
                    JOIN Admins a ON t.AdminID = a.AdminID
                    WHERE t.TransactionID = @TransactionID
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
                    SELECT t.*, 
                           CASE 
                               WHEN t.RentalID IS NOT NULL THEN 'Rental'
                               WHEN t.PurchaseID IS NOT NULL THEN 'Purchase'
                           END as TransactionType
                    FROM Transactions t
                    WHERE t.UserID = @UserID
                    ORDER BY t.TransactionDate DESC
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
                    SELECT t.*, u.FullName as UserName, a.FullName as AdminName,
                           CASE 
                               WHEN t.RentalID IS NOT NULL THEN 'Rental'
                               WHEN t.PurchaseID IS NOT NULL THEN 'Purchase'
                           END as TransactionType
                    FROM Transactions t
                    JOIN Users u ON t.UserID = u.UserID
                    JOIN Admins a ON t.AdminID = a.AdminID
                    ORDER BY t.TransactionDate DESC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async getRentalTransactions() {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query(`
                    SELECT t.*, u.FullName as UserName, g.GameTitle
                    FROM Transactions t
                    JOIN Users u ON t.UserID = u.UserID
                    JOIN Rentals r ON t.RentalID = r.RentalID
                    JOIN DigitalCopies dc ON r.CopyID = dc.CopyID
                    JOIN Games g ON dc.GameID = g.GameID
                    WHERE t.RentalID IS NOT NULL
                    ORDER BY t.TransactionDate DESC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async getPurchaseTransactions() {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query(`
                    SELECT t.*, u.FullName as UserName, g.GameTitle
                    FROM Transactions t
                    JOIN Users u ON t.UserID = u.UserID
                    JOIN Purchases p ON t.PurchaseID = p.PurchaseID
                    JOIN PhysicalCopies pc ON p.CopyID = pc.CopyID
                    JOIN Games g ON pc.GameID = g.GameID
                    WHERE t.PurchaseID IS NOT NULL
                    ORDER BY t.TransactionDate DESC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async getTransactionStats(startDate, endDate) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('StartDate', require('mssql').Date, startDate)
                .input('EndDate', require('mssql').Date, endDate)
                .query(`
                    SELECT 
                        COUNT(*) as TotalTransactions,
                        SUM(Amount) as TotalRevenue,
                        AVG(Amount) as AverageTransaction,
                        SUM(DiscountApplied) as TotalDiscounts
                    FROM Transactions
                    WHERE TransactionDate BETWEEN @StartDate AND @EndDate
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Transaction;
