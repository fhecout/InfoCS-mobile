const { getInMatch } = require('../services/inMatchService');

async function fetchInMatch(req, res, next) {
  try {
    const { matchUrl } = req.query;
    
    if (!matchUrl) {
      return res.status(400).json({
        success: false,
        error: 'URL da partida é obrigatória'
      });
    }

    if (!matchUrl.includes('hltv.org/matches/')) {
      return res.status(400).json({
        success: false,
        error: 'URL inválida. Deve ser uma URL de partida da HLTV'
      });
    }

    const inMatch = await getInMatch(matchUrl);
    res.json(inMatch);
  } catch (error) {
    console.error('Erro ao buscar informações da partida:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar informações da partida'
    });
  }
}

module.exports = { fetchInMatch };
