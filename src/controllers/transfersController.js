const { getTransfers } = require('../services/transfersService');

async function fetchTransfers(req, res, next) {
  try {
    const { ranking } = req.query;
    const transfers = await getTransfers(ranking);
    res.json(transfers);
  } catch (error) {
    next(error);
  }
}

module.exports = { fetchTransfers }; 