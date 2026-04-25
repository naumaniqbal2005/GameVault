const User = require('../models/User');
const Game = require('../models/Game');
const Rental = require('../models/Rental');
const Transaction = require('../models/Transaction');

const getDashboardStats = async (req, res) => {
    try {
        const pool = require('../config/db').poolPromise;
        const poolConnection = await pool;

        // Get total users
        const usersResult = await poolConnection.request().query('SELECT COUNT(*) as count FROM Users');
        const totalUsers = usersResult.recordset[0].count;

        // Get total games
        const gamesResult = await poolConnection.request().query('SELECT COUNT(*) as count FROM Games');
        const totalGames = gamesResult.recordset[0].count;

        // Get active rentals
        const activeRentalsResult = await poolConnection.request().query(`
            SELECT COUNT(*) as count FROM Rentals WHERE DateReturned IS NULL
        `);
        const activeRentals = activeRentalsResult.recordset[0].count;

        // Get total revenue
        const revenueResult = await poolConnection.request().query(`
            SELECT SUM(Amount) as total FROM Transactions
        `);
        const totalRevenue = revenueResult.recordset[0].total || 0;

        // Get total rentals
        const totalRentalsResult = await poolConnection.request().query('SELECT COUNT(*) as count FROM Rentals');
        const totalRentals = totalRentalsResult.recordset[0].count;

        // Get total purchases
        const totalPurchasesResult = await poolConnection.request().query('SELECT COUNT(*) as count FROM Purchases');
        const totalPurchases = totalPurchasesResult.recordset[0].count;

        // Get available digital copies
        const availableDigitalResult = await poolConnection.request().query(`
            SELECT COUNT(*) as count FROM DigitalCopies WHERE Availability = 'Available'
        `);
        const availableDigital = availableDigitalResult.recordset[0].count;

        // Get available physical copies
        const availablePhysicalResult = await poolConnection.request().query(`
            SELECT COUNT(*) as count FROM PhysicalCopies WHERE Availability = 'Available'
        `);
        const availablePhysical = availablePhysicalResult.recordset[0].count;

        // Get recent transactions (last 5)
        const recentTransactionsResult = await poolConnection.request().query(`
            SELECT TOP 5 t.*, u.FullName as UserName, a.FullName as AdminName,
                   CASE 
                       WHEN t.RentalID IS NOT NULL THEN 'Rental'
                       WHEN t.PurchaseID IS NOT NULL THEN 'Purchase'
                   END as TransactionType
            FROM Transactions t
            JOIN Users u ON t.UserID = u.UserID
            JOIN Admins a ON t.AdminID = a.AdminID
            ORDER BY t.TransactionDate DESC
        `);
        const recentTransactions = recentTransactionsResult.recordset;

        // Get overdue rentals
        const overdueRentalsResult = await poolConnection.request().query(`
            SELECT COUNT(*) as count FROM Rentals 
            WHERE DateReturned IS NULL AND DateDue < GETDATE()
        `);
        const overdueRentals = overdueRentalsResult.recordset[0].count;

        res.json({
            totalUsers,
            totalGames,
            activeRentals,
            totalRevenue: parseFloat(totalRevenue).toFixed(2),
            totalRentals,
            totalPurchases,
            availableDigital,
            availablePhysical,
            recentTransactions,
            overdueRentals
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDashboardStats
};
