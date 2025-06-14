const rankingScraper = require('../scraping/rankingScraper');

async function getRanking() {
  return await rankingScraper();
}

module.exports = { getRanking }; 