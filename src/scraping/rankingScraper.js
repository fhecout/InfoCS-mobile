const puppeteer = require('puppeteer');

module.exports = async function rankingScraper() {
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
        const url = `https://www.hltv.org/ranking/teams`;
        await page.goto(url, { waitUntil: 'networkidle2' });

        const ranking = await page.evaluate(() => {
            const data = [];
            const teams = document.querySelectorAll('.ranked-team.standard-box');
            for (let i = 0; i < teams.length && data.length < 30; i++) {
                const el = teams[i];
                const position = el.querySelector('.position')?.innerText.trim() || '';
                const name = el.querySelector('.teamLine .lineup .name')?.innerText.trim() || el.querySelector('.teamLine .name')?.innerText.trim() || '';
                const points = el.querySelector('.points')?.innerText.replace('HLTV points', '').replace(/[()]/g, '').trim() || '';
                const logo = el.querySelector('.team-logo img')?.getAttribute('src') || '';
                const link = el.querySelector('.more a.moreLink')?.getAttribute('href') || '';
                const players = Array.from(el.querySelectorAll('.lineup-con .player-holder')).map(td => {
                    const a = td.querySelector('a.pointer');
                    const img = a?.querySelector('img.playerPicture');
                    const nickDiv = a?.querySelector('.nick');
                    const flagImg = nickDiv?.querySelector('img.flag');
                    return {
                        name: nickDiv?.innerText.replace(flagImg?.outerText || '', '').trim() || '',
                        link: a ? `https://www.hltv.org${a.getAttribute('href')}` : '',
                        country: flagImg?.getAttribute('title') || '',
                        countryFlag: flagImg?.getAttribute('src') || '',
                        picture: img?.getAttribute('src') || ''
                    };
                });
                data.push({
                    position,
                    name,
                    points,
                    logo,
                    players,
                    link: link ? `https://www.hltv.org${link}` : ''
                });
            }
            return data;
        });

        return ranking;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
} 