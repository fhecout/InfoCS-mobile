const puppeteer = require('puppeteer');

module.exports = async function resultsScraper() {
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
        await page.goto('https://www.hltv.org/results', { waitUntil: 'networkidle2' });

        const results = await page.evaluate(() => {
            const data = [];
            const resultEls = document.querySelectorAll('.result-con');
            for (let i = 0; i < resultEls.length && data.length < 20; i++) {
                const el = resultEls[i];
                const link = el.querySelector('a.a-reset')?.getAttribute('href') || '';
                const row = el.querySelector('.result');
                if (!row) continue;

                // Times
                const team1Div = row.querySelector('.team1');
                const team2Div = row.querySelector('.team2');
                const team1Name = team1Div?.querySelector('.team')?.innerText.trim() || '';
                const team2Name = team2Div?.querySelector('.team')?.innerText.trim() || '';
                const team1Logo = team1Div?.querySelector('img.team-logo')?.getAttribute('src') || '';
                const team2Logo = team2Div?.querySelector('img.team-logo')?.getAttribute('src') || '';

                // Score
                const score = row.querySelector('.result-score')?.innerText.trim() || '';

                // Evento
                const eventCell = row.querySelector('.event');
                const eventName = eventCell?.querySelector('.event-name')?.innerText.trim() || '';
                const eventLogo = eventCell?.querySelector('img.event-logo')?.getAttribute('src') || '';

                // Formato
                const format = row.querySelector('.map-text')?.innerText.trim() || '';

                data.push({
                    team1: { name: team1Name, logo: team1Logo },
                    team2: { name: team2Name, logo: team2Logo },
                    score,
                    event: { name: eventName, logo: eventLogo },
                    format,
                    link: link ? `https://www.hltv.org${link}` : ''
                });
            }
            return data;
        });

        return results;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
} 