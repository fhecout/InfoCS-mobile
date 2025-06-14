const resultsScraper = require('../scraping/resultsScraper');

async function getResults() {
  return await resultsScraper();
}

module.exports = { getResults }; 