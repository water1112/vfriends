const fs = require('fs');
const path = require('path');
const { analyze } = require('./claude');
const { extractJson } = require('../utils/parse-json');

const prompt = fs.readFileSync(path.join(__dirname, '../prompts/portrait.md'), 'utf8');

async function analyzePortrait(imageInput) {
  const fullPrompt = imageInput.description
    ? `${prompt}\n\n以下是照片描述：${imageInput.description}`
    : prompt;

  const options = imageInput.description
    ? {}
    : { images: [{ base64: imageInput.base64, mediaType: imageInput.mediaType }] };

  const result = await analyze(fullPrompt, options);
  return extractJson(result);
}

module.exports = { analyzePortrait };
