const inMatchScraper = require('../scraping/inMatchScraper');

/**
 * Busca informações de veto de mapas de uma partida específica
 * @param {string} matchUrl - URL da partida na HLTV
 * @returns {Promise<Object>} Objeto contendo as informações de veto
 */
async function getInMatch(matchUrl) {
  return await inMatchScraper(matchUrl);
}

module.exports = { getInMatch };
