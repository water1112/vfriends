const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { analyze } = require('./claude');
const { extractJson } = require('../utils/parse-json');
const { saveProfile } = require('../utils/data-store');

const prompt = fs.readFileSync(path.join(__dirname, '../prompts/personality.md'), 'utf8');

async function buildProfile(analyses) {
  const fullPrompt = `${prompt}\n\n以下是各维度分析结果：\n\n${JSON.stringify(analyses, null, 2)}`;
  const result = await analyze(fullPrompt);
  const traits = extractJson(result);

  const profile = {
    profile_id: uuidv4(),
    created_at: new Date().toISOString(),
    ...traits,
    raw_analyses: analyses,
  };

  await saveProfile(profile);

  return profile;
}

module.exports = { buildProfile };
