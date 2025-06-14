const matchesScraper = require('../scraping/matchesScraper');

async function getMatches(date) {
  return await matchesScraper(date);
}

module.exports = { getMatches };
