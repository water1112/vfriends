/**
 * 从 Claude 返回的文本中提取并解析 JSON。
 * 处理：无 JSON、嵌套大括号、JSON 解析失败等情况。
 */
function extractJson(text) {
  // 尝试从 ```json ... ``` 代码块中提取
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1].trim());
  }

  // 尝试贪婪匹配最外层 { ... }
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (!braceMatch) {
    throw new Error('AI 返回内容中未找到 JSON');
  }

  try {
    return JSON.parse(braceMatch[0]);
  } catch {
    // 贪婪匹配失败时，逐字符找匹配的大括号
    const start = text.indexOf('{');
    if (start === -1) {
      throw new Error('AI 返回内容中未找到 JSON');
    }

    let depth = 0;
    for (let i = start; i < text.length; i++) {
      if (text[i] === '{') depth++;
      if (text[i] === '}') depth--;
      if (depth === 0) {
        return JSON.parse(text.slice(start, i + 1));
      }
    }

    throw new Error('AI 返回的 JSON 格式不完整');
  }
}

module.exports = { extractJson };
