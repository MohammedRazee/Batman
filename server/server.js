require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/game', gameRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'SIGNAL LOST. Something broke on the island.' });
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`[api] listening on :${PORT}`)))
  .catch((err) => {
    console.error('[db] connection failed. Is MongoDB running?', err.message);
    process.exit(1);
  });
