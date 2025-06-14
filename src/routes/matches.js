const express = require('express');
const { fetchMatches } = require('../controllers/matchesController');
const { validateDateQuery } = require('../../middlewares/validate');

const router = express.Router();

router.get('/', fetchMatches);
router.get('/date', validateDateQuery, fetchMatches);

module.exports = router;
