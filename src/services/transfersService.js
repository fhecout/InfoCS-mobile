const transfersScraper = require('../scraping/transfScraper');

async function getTransfers(ranking) {
  return await transfersScraper(ranking);
}

module.exports = { getTransfers }; 