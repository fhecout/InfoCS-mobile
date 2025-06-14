const puppeteer = require('puppeteer');

module.exports = async function transfersScraper(ranking) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        });
        let url = 'https://www.hltv.org/transfers?startDate=all';
        if ([5, 10, 20, 30].includes(Number(ranking))) {
            url += `&ranking=Top${ranking}`;
        }
        await page.goto(url, { waitUntil: 'networkidle2' });

        const transfers = await page.evaluate(() => {
            const data = [];
            const rows = document.querySelectorAll('.transfer-row');
            for (let row of rows) {
                // Jogador
                const playerLink = row.querySelector('.transfer-player-image-container')?.getAttribute('href') || '';
                const playerImg = row.querySelector('.transfer-player-image')?.getAttribute('src') || '';
                const playerName = row.querySelector('.transfer-player-image')?.getAttribute('alt') || '';

                // Times
                const teamContainers = row.querySelectorAll('.transfer-teams-container .transfer-team-container');
                // Pode ser: [from, to] ou [from] ou [to]
                const fromTeamDiv = teamContainers[0];
                const toTeamDiv = teamContainers[1];

                // Time de origem
                let fromTeam = {
                    name: '',
                    logo: '',
                    status: ''
                };
                if (fromTeamDiv) {
                    fromTeam.name = fromTeamDiv.querySelector('.transfer-team-no-team')?.innerText
                        || fromTeamDiv.querySelector('.transfer-team-logo')?.getAttribute('alt')
                        || '';
                    fromTeam.logo = fromTeamDiv.querySelector('.transfer-team-logo')?.getAttribute('src') || '';
                    fromTeam.status = fromTeamDiv.querySelector('.transfer-team-status')?.innerText || '';
                }

                // Time de destino
                let toTeam = {
                    name: '',
                    logo: '',
                    status: ''
                };
                if (toTeamDiv) {
                    toTeam.name = toTeamDiv.querySelector('.transfer-team-no-team')?.innerText
                        || toTeamDiv.querySelector('.transfer-team-logo')?.getAttribute('alt')
                        || '';
                    toTeam.logo = toTeamDiv.querySelector('.transfer-team-logo')?.getAttribute('src') || '';
                    toTeam.status = toTeamDiv.querySelector('.transfer-team-status')?.innerText || '';
                }

                // Texto do movimento (ex: "fulano joins ciclano", "fulano parts ways with ciclano")
                const movement = row.querySelector('.transfer-movement')?.innerText || '';

                // Data
                const date = row.querySelector('.transfer-date')?.innerText || '';

                data.push({
                    player: {
                        name: playerName,
                        link: playerLink,
                        img: playerImg
                    },
                    fromTeam,
                    toTeam,
                    movement,
                    date
                });
            }
            return data;
        });

        return transfers;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
};
