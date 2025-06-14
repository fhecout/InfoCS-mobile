const cron = require('node-cron');
const matchesScraper = require('../scraping/matchesScraper');

// Executa a cada 3 minutos
cron.schedule('*/1 * * * *', async () => {
    console.log('Executando monitoramento de partidas...');
    try {
        const partidas = await matchesScraper();
        // Aqui você pode comparar com o último estado salvo, enviar notificações, etc.
        // Exemplo: console.log(partidas);
    } catch (err) {
        console.error('Erro ao monitorar partidas:', err);
    }
});