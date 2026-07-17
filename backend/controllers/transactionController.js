const Transaction = require('../models/Transaction');

const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.getAll();
        res.json(transactions);
    } catch (error) {
        console.error('Get all transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getTransactionById = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json(transaction);
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserTransactions = async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await Transaction.findByUserId(userId);
        res.json(transactions);
    } catch (error) {
        console.error('Get user transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getRentalTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.getRentalTransactions();
        res.json(transactions);
    } catch (error) {
        console.error('Get rental transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getPurchaseTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.getAll();
        const purchaseTransactions = transactions.filter(t => t.CopyID !== null);
        res.json(purchaseTransactions);
    } catch (error) {
        console.error('Get purchase transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllTransactions,
    getTransactionById,
    getUserTransactions,
    getRentalTransactions,
    getPurchaseTransactions
};
