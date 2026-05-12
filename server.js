const express = require('express');
const path = require('path');
const config = require('./src/config');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/analyze', require('./src/routes/analysis'));
app.use('/api/persona', require('./src/routes/persona'));
app.use('/api/chat', require('./src/routes/chat'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
