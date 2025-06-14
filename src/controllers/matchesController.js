const { getMatches } = require('../services/matchesService');

async function fetchMatches(req, res, next) {
  try {
    const { date } = req.query;
    const matches = await getMatches(date);
    res.json(matches);
  } catch (error) {
    next(error);
  }
}

module.exports = { fetchMatches };
