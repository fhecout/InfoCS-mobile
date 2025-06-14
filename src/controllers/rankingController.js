const { getRanking } = require('../services/rankingService');

async function fetchRanking(req, res, next) {
  try {
    const ranking = await getRanking();
    res.json(ranking);
  } catch (error) {
    next(error);
  }
}

module.exports = { fetchRanking }; 