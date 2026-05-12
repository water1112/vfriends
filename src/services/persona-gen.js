const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { analyze } = require('./claude');
const { extractJson } = require('../utils/parse-json');

const prompt = fs.readFileSync(path.join(__dirname, '../prompts/persona-gen.md'), 'utf8');

async function createPersona(profile) {
  const fullPrompt = `${prompt}\n\n用户人格画像：\n\n${JSON.stringify(profile, null, 2)}`;
  const result = await analyze(fullPrompt);
  const personaData = extractJson(result);

  return {
    persona_id: uuidv4(),
    created_at: new Date().toISOString(),
    based_on_profile: profile.profile_id,
    ...personaData,
  };
}

module.exports = { createPersona };
