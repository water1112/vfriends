const fs = require('fs');
const path = require('path');
const { chat } = require('./claude');

const template = fs.readFileSync(path.join(__dirname, '../prompts/persona-chat.md'), 'utf8');

function buildSystemPrompt(persona) {
  return template
    .replace('{name}', persona.name)
    .replace('{age}', persona.age)
    .replace('{personality}', persona.personality)
    .replace('{speaking_style}', persona.speaking_style)
    .replace('{background_story}', persona.background_story)
    .replace('{relationship_dynamic}', persona.relationship_dynamic)
    .replace('{interests}', Array.isArray(persona.interests) ? persona.interests.join('、') : persona.interests)
    .replace('{catchphrases}', Array.isArray(persona.catchphrases) ? persona.catchphrases.join('、') : persona.catchphrases)
    .replace('{boundaries}', Array.isArray(persona.boundaries) ? persona.boundaries.join('；') : persona.boundaries);
}

async function chatWithPersona(persona, message, history = []) {
  const systemPrompt = buildSystemPrompt(persona);

  const messages = [
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: message },
  ];

  return await chat(systemPrompt, messages);
}

module.exports = { chatWithPersona };
