const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');

const clientOpts = { apiKey: config.anthropicApiKey, timeout: 120000 };
if (config.anthropicBaseUrl) clientOpts.baseURL = config.anthropicBaseUrl;
const client = new Anthropic(clientOpts);

async function analyze(prompt, options = {}) {
  const { images, maxTokens = 4096, system } = options;

  const content = [];

  if (images && images.length > 0) {
    for (const img of images) {
      content.push({
        type: 'image',
        source: img.url
          ? { type: 'url', url: img.url }
          : { type: 'base64', media_type: img.mediaType || 'image/jpeg', data: img.base64 },
      });
    }
  }

  content.push({ type: 'text', text: prompt });

  const params = {
    model: config.anthropicModel,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content }],
  };
  if (system) params.system = system;

  const response = await client.messages.create(params);

  return response.content[0].text;
}

async function chat(systemPrompt, messages) {
  const response = await client.messages.create({
    model: config.anthropicModel,
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  });

  return response.content[0].text;
}

module.exports = { analyze, chat };
