const express = require('express');
const { fetchTransfers } = require('../controllers/transfersController');

const router = express.Router();

router.get('/', fetchTransfers);

module.exports = router; 