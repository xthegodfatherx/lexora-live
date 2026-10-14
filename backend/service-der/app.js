const express = require('express');
const cors = require('cors');
const derRoutes = require('./routes/der');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'service-der', status: 'UP' });
});

app.use('/der', derRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route introuvable: ${req.method} ${req.url}` });
});

module.exports = app;
