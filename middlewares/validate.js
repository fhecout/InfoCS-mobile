function validateDateQuery(req, res, next) {
  const { date } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Parâmetro "date" é obrigatório no formato YYYY-MM-DD.' });
  }
  next();
}

module.exports = { validateDateQuery }; 