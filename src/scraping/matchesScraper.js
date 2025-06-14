const puppeteer = require('puppeteer');

module.exports = async function matchesScraper(date) {
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
        const url = date ? `https://www.hltv.org/matches?selectedDate=${date}` : 'https://www.hltv.org/matches';
        await page.goto(url, { waitUntil: 'networkidle2' });

        const matches = await page.evaluate(() => {
            const data = [];
            const seen = new Set();
            const matchEls = document.querySelectorAll('.match');
            for (let i = 0; i < matchEls.length && data.length < 20; i++) {
                const match = matchEls[i];
                const status = match.querySelector('.match-meta-live')?.innerText.trim().toUpperCase() || '';

                if (status === 'LIVE') {
                    // Pega os nomes e logos dos times ao vivo
                    const teamDivs = match.querySelectorAll('.match-teams .match-team');
                    if (teamDivs.length === 2) {
                        const team1Name = teamDivs[0].querySelector('.match-teamname.text-ellipsis')?.innerText.trim() || '';
                        const team2Name = teamDivs[1].querySelector('.match-teamname.text-ellipsis')?.innerText.trim() || '';
                        const team1Logo = teamDivs[0].querySelector('.match-team-logo')?.getAttribute('src') || '';
                        const team2Logo = teamDivs[1].querySelector('.match-team-logo')?.getAttribute('src') || '';

                        const key = `LIVE-${team1Name}-vs-${team2Name}`;
                        if (team1Name && team2Name && !seen.has(key)) {
                            seen.add(key);
                            data.push({
                                status: 'LIVE',
                                team1: { name: team1Name, logo: team1Logo },
                                team2: { name: team2Name, logo: team2Logo }
                            });
                        }
                    }
                } else {
                    // Estrutura completa para partidas futuras
                    let team1 = { name: '', logo: '', country: '', score: '' };
                    let team2 = { name: '', logo: '', country: '', score: '' };
                    const team1Div = match.querySelector('.match-team.team1');
                    const team2Div = match.querySelector('.match-team.team2');
                    team1.name = team1Div?.querySelector('.match-teamname')?.innerText.trim() || '';
                    team2.name = team2Div?.querySelector('.match-teamname')?.innerText.trim() || '';
                    team1.logo = team1Div?.querySelector('.match-team-logo')?.getAttribute('src') || '';
                    team2.logo = team2Div?.querySelector('.match-team-logo')?.getAttribute('src') || '';
                    team1.country = team1Div?.querySelector('.country-flag-small')?.getAttribute('title') || '';
                    team2.country = team2Div?.querySelector('.country-flag-small')?.getAttribute('title') || '';
                    team1.score = '';
                    team2.score = '';
                    const time = match.querySelector('.match-time')?.innerText.trim() || '';
                    const meta = match.querySelector('.match-meta')?.innerText.trim() || '';
                    const eventName = match.querySelector('.match-event')?.innerText.trim() || '';
                    let eventLogo = '';
                    const eventLogoImg = match.querySelector('img.match-event-logo')
                      || match.querySelector('.match-event-logo img')
                      || match.querySelector('.match-event-logo-container img');
                    if (eventLogoImg) {
                        eventLogo = eventLogoImg.getAttribute('src') || '';
                    }
                    data.push({
                        time,
                        meta,
                        status,
                        team1,
                        team2,
                        event: {
                            name: eventName,
                            logo: eventLogo
                        },
                        link: match.querySelector('.match-info')?.getAttribute('href') ? `https://www.hltv.org${match.querySelector('.match-info')?.getAttribute('href')}` : ''
                    });
                }
            }
            return data;
        });

        return matches;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}