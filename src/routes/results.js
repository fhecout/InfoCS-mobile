const express = require('express');
const { fetchResults } = require('../controllers/resultsController');

const router = express.Router();

router.get('/', fetchResults);

module.exports = router; 