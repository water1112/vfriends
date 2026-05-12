const fs = require('fs');
const path = require('path');
const { analyze } = require('./claude');
const { extractJson } = require('../utils/parse-json');

const prompt = fs.readFileSync(path.join(__dirname, '../prompts/language-style.md'), 'utf8');

async function analyzeLanguageStyle(text) {
  const fullPrompt = `${prompt}\n\n以下是聊天记录：\n\n${text}`;
  const result = await analyze(fullPrompt);
  return extractJson(result);
}

module.exports = { analyzeLanguageStyle };
