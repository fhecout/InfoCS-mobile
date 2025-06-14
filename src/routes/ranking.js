const express = require('express');
const { fetchRanking } = require('../controllers/rankingController');

const router = express.Router();

router.get('/', fetchRanking);

module.exports = router; 