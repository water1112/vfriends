const fs = require('fs');
const path = require('path');
const { analyze } = require('./claude');
const { extractJson } = require('../utils/parse-json');

const prompt = fs.readFileSync(path.join(__dirname, '../prompts/persona-iterate.md'), 'utf8');

async function iteratePersona(persona, newAnalysis) {
  const fullPrompt = `${prompt}\n\n现有人设：\n${JSON.stringify(persona, null, 2)}\n\n新分析结果：\n${JSON.stringify(newAnalysis, null, 2)}`;
  const result = await analyze(fullPrompt);
  const parsed = extractJson(result);

  // 保留原始元数据
  const updatedPersona = {
    ...parsed.persona,
    persona_id: persona.persona_id,
    created_at: persona.created_at,
    updated_at: new Date().toISOString(),
    based_on_profile: persona.based_on_profile,
    iteration_history: [
      ...(persona.iteration_history || []),
      { changes: parsed.changes, confidence: parsed.confidence, summary: parsed.summary, at: new Date().toISOString() },
    ],
  };

  return {
    persona: updatedPersona,
    changes: parsed.changes,
    confidence: parsed.confidence,
    summary: parsed.summary,
  };
}

module.exports = { iteratePersona };
