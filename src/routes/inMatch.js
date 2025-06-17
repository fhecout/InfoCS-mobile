const express = require('express');
const router = express.Router();
const { fetchInMatch } = require('../controllers/inMatchController');

// Rota para buscar informações de veto de uma partida específica
router.get('/', fetchInMatch);

module.exports = router;
