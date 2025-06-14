const express = require('express');
const dotenv = require('dotenv');
const matchesRoutes = require('./src/routes/matches');
const resultsRoutes = require('./src/routes/results');
const rankingRoutes = require('./src/routes/ranking');
const transfersRoutes = require('./src/routes/transfers');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/matches', matchesRoutes);
app.use('/results', resultsRoutes);
app.use('/ranking', rankingRoutes);
app.use('/transfers', transfersRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});