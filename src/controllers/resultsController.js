const { getResults } = require('../services/resultsService');

async function fetchResults(req, res, next) {
  try {
    const results = await getResults();
    res.json(results);
  } catch (error) {
    next(error);
  }
}

module.exports = { fetchResults }; 