const puppeteer = require('puppeteer');

module.exports = async function inMatchScraper(matchUrl) {
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

        await page.goto(matchUrl, { waitUntil: 'networkidle2' });

        // Loga o HTML completo de todas as divs de veto
        const vetoBoxesHtml = await page.$$eval('.standard-box.veto-box', nodes => nodes.map(n => n.innerHTML));
        vetoBoxesHtml.forEach((html, i) => {
            console.log(`HTML do bloco de veto #${i + 1}:`, html);
        });

        // Extrai as linhas de veto da segunda (ou da correta)
        const vetoInfo = await page.evaluate(() => {
            const vetoBoxes = Array.from(document.querySelectorAll('.standard-box.veto-box'));
            for (const box of vetoBoxes) {
                const vetoDivs = box.querySelectorAll('.padding div');
                if (vetoDivs.length > 0) {
                    // Encontrou o bloco certo!
                    return Array.from(vetoDivs).map(div => div.textContent.trim());
                }
            }
            return [];
        });

        if (vetoInfo && vetoInfo.length > 0) {
            console.log('Linhas de veto encontradas:');
            vetoInfo.forEach((linha, i) => console.log(`${i + 1}: ${linha}`));
        } else {
            console.log('Nenhuma linha de veto encontrada!');
        }

        // Extrai informações dos times, bandeiras, placar, evento, data/hora
        const teamsInfo = await page.evaluate(() => {
            function absUrl(url) {
                if (!url) return '';
                if (url.startsWith('http')) return url;
                return 'https://www.hltv.org' + url;
            }
            const box = document.querySelector('.standard-box.teamsBox');
            if (!box) return null;
            const teamDivs = box.querySelectorAll('.team');
            if (!teamDivs || teamDivs.length < 2) return null;
            const team1 = teamDivs[0];
            const team2 = teamDivs[1];
            // Team 1
            const team1CountryImg = team1.querySelector('img.team1');
            const team1Country = team1CountryImg?.getAttribute('title') || '';
            const team1CountryFlag = absUrl(team1CountryImg?.getAttribute('src'));
            const team1LogoImg = team1.querySelector('.logo');
            const team1Logo = absUrl(team1LogoImg?.getAttribute('src'));
            const team1Name = team1.querySelector('.teamName')?.textContent.trim() || '';
            const team1Score = team1.querySelector('.lost, .won')?.textContent.trim() || '';
            // Team 2
            const team2CountryImg = team2.querySelector('img.team2');
            const team2Country = team2CountryImg?.getAttribute('title') || '';
            const team2CountryFlag = absUrl(team2CountryImg?.getAttribute('src'));
            let team2LogoImg = team2.querySelector('.logo.night-only') || team2.querySelector('.logo.day-only') || team2.querySelector('.logo');
            const team2Logo = absUrl(team2LogoImg?.getAttribute('src'));
            const team2Name = team2.querySelector('.teamName')?.textContent.trim() || '';
            const team2Score = team2.querySelector('.lost, .won')?.textContent.trim() || '';
            // Evento, data, hora, status
            const timeAndEvent = box.querySelector('.timeAndEvent');
            const time = timeAndEvent?.querySelector('.time')?.textContent.trim() || '';
            const date = timeAndEvent?.querySelector('.date')?.textContent.trim() || '';
            const status = timeAndEvent?.querySelector('.countdown')?.textContent.trim() || '';
            const eventDiv = timeAndEvent?.querySelector('.event a');
            const eventName = eventDiv?.textContent.trim() || '';
            const eventLink = eventDiv ? absUrl(eventDiv.getAttribute('href')) : '';
            return {
                team1: {
                    name: team1Name,
                    logo: team1Logo,
                    country: team1Country,
                    countryFlag: team1CountryFlag,
                    score: team1Score
                },
                team2: {
                    name: team2Name,
                    logo: team2Logo,
                    country: team2Country,
                    countryFlag: team2CountryFlag,
                    score: team2Score
                },
                event: {
                    name: eventName,
                    link: eventLink
                },
                time,
                date,
                status
            };
        });

        if (teamsInfo) {
            console.log('Informações dos times extraídas:', teamsInfo);
        } else {
            console.log('Bloco de times não encontrado!');
        }

        // Extrai estatísticas dos jogadores (match stats)
        const matchStats = await page.evaluate(() => {
            function absUrl(url) {
                if (!url) return '';
                if (url.startsWith('http')) return url;
                return 'https://www.hltv.org' + url;
            }
            const stats = [];
            // Pega todos os mapas do menu
            const mapMenu = document.querySelectorAll('.box-headline .stats-menu-link .dynamic-map-name-full');
            if (!mapMenu || mapMenu.length === 0) return [];
            const mapIds = [];
            mapMenu.forEach(div => {
                const id = div.id;
                const mapName = div.textContent.trim();
                if (id && mapName) {
                    mapIds.push({ id, mapName });
                }
            });
            // Para cada mapa, pega a tabela correspondente
            mapIds.forEach(({ id, mapName }) => {
                const contentId = id === 'all' ? 'all-content' : id + '-content';
                const contentDiv = document.getElementById(contentId);
                if (!contentDiv) return;
                // Pega todas as tabelas de stats (uma para cada time)
                const tables = contentDiv.querySelectorAll('table.table.totalstats');
                if (!tables || tables.length === 0) return;
                const teams = [];
                tables.forEach(table => {
                    // Nome do time
                    const teamName = table.querySelector('.align-logo .teamName')?.textContent.trim() ||
                        table.querySelector('.align-logo a.teamName')?.textContent.trim() || '';
                    // Jogadores
                    const players = [];
                    const rows = table.querySelectorAll('tr:not(.header-row)');
                    if (!rows || rows.length === 0) return;
                    rows.forEach(row => {
                        const playerCell = row.querySelector('td.players .flagAlign a');
                        if (!playerCell) return;
                        const nameDiv = playerCell.querySelector('.gtSmartphone-only.statsPlayerName');
                        const nickSpan = playerCell.querySelector('.player-nick');
                        const countryImg = playerCell.querySelector('img.flag');
                        players.push({
                            name: nameDiv ? nameDiv.textContent.replace(/'/g, '').replace(/\s+/g, ' ').trim() : '',
                            nick: nickSpan ? nickSpan.textContent.trim() : '',
                            country: countryImg ? countryImg.getAttribute('title') : '',
                            flag: countryImg ? absUrl(countryImg.getAttribute('src')) : '',
                            link: playerCell.getAttribute('href') ? absUrl(playerCell.getAttribute('href')) : '',
                            kd: row.querySelector('td.kd')?.textContent.trim() || '',
                            plusMinus: row.querySelector('td.plus-minus')?.textContent.trim() || '',
                            adr: row.querySelector('td.adr')?.textContent.trim() || '',
                            kast: row.querySelector('td.kast')?.textContent.trim() || '',
                            rating: row.querySelector('td.rating')?.textContent.trim() || ''
                        });
                    });
                    teams.push({
                        name: teamName,
                        players
                    });
                });
                stats.push({
                    map: mapName,
                    teams
                });
            });
            return stats;
        });

        if (matchStats && matchStats.length > 0) {
            console.log('Match stats extraídas:', matchStats);
        } else {
            console.log('Nenhuma match stat encontrada!');
        }

        // Extrai informações dos mapas
        const mapsInfo = await page.evaluate(() => {
            function absUrl(url) {
                if (!url) return '';
                if (url.startsWith('http')) return url;
                return 'https://www.hltv.org' + url;
            }

            const maps = [];
            const mapholders = document.querySelectorAll('.mapholder');
            if (!mapholders || mapholders.length === 0) return [];
            mapholders.forEach(holder => {
                const mapNameHolder = holder.querySelector('.map-name-holder');
                const mapName = mapNameHolder?.querySelector('.mapname')?.textContent.trim() || '';
                const results = holder.querySelector('.results');
                if (!results) return;
                const team1 = results.querySelector('.results-left');
                const team2 = results.querySelector('.results-right');
                const team1Name = team1?.querySelector('.results-teamname')?.textContent.trim() || '';
                const team1Score = team1?.querySelector('.results-team-score')?.textContent.trim() || '';
                const team2Name = team2?.querySelector('.results-teamname')?.textContent.trim() || '';
                const team2Score = team2?.querySelector('.results-team-score')?.textContent.trim() || '';
                const halfScores = results.querySelector('.results-center-half-score')?.textContent.trim() || '';
                maps.push({
                    name: mapName,
                    team1: {
                        name: team1Name,
                        score: team1Score
                    },
                    team2: {
                        name: team2Name,
                        score: team2Score
                    },
                    halfScores: halfScores
                });
            });
            return maps;
        });

        if (mapsInfo && mapsInfo.length > 0) {
            console.log('Informações dos mapas extraídas:', mapsInfo);
        } else {
            console.log('Nenhuma informação de mapa encontrada!');
        }

        return {
            success: true,
            teamsInfo: teamsInfo || {},
            vetoInfo: vetoInfo || [],
            matchStats: matchStats || [],
            mapsInfo: mapsInfo || []
        };

    } catch (error) {
        console.log(error);
        return {
            success: false,
            error: error.message
        };
    } finally {
        if (browser) await browser.close();
    }
};
