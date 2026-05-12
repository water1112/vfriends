require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL,
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
  dataDir: require('path').join(__dirname, 'data'),
};
