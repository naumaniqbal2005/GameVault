const express = require('express');
const router = express.Router();

const {
    getAllTransactions,
    getTransactionById,
    getUserTransactions,
    getRentalTransactions,
    getPurchaseTransactions
} = require('../controllers/transactionController');

router.get('/', getAllTransactions);
router.get('/:transactionId', getTransactionById);
router.get('/user/:userId', getUserTransactions);
router.get('/rentals', getRentalTransactions);
router.get('/purchases', getPurchaseTransactions);

module.exports = router;
