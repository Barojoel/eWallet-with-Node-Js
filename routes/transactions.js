const express = require('express');
const router = express.Router();

const Transaction = require('../controllers/transactions');

router.post('/transfer', Transaction.transfer);

module.exports = router;