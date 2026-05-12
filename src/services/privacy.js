const { analyze } = require('./claude');
const { extractJson } = require('../utils/parse-json');

const SYSTEM_PROMPT = `你是一个隐私脱敏专家。对输入文本进行智能脱敏处理。

规则：
1. 识别并替换所有个人隐私信息：
   - 人名 → [姓名A]、[姓名B]...
   - 手机号 → [手机号]
   - 身份证号 → [身份证号]
   - 地址 → [地址]
   - 邮箱 → [邮箱]
   - 银行卡号 → [银行卡号]
   - 微信号/QQ号 → [社交账号]
   - 公司/学校名 → [机构名]
   - 其他可识别个人信息 → [隐私信息]

2. 保持文本的语义完整性和可读性
3. 同一人名在整个文本中使用相同的替代标签

请严格按以下JSON格式输出：
{
  "desensitized_text": "脱敏后的完整文本",
  "redacted_items": [
    {"type": "姓名", "original": "张三", "replacement": "[姓名A]"},
    {"type": "手机号", "original": "13800138000", "replacement": "[手机号]"}
  ],
  "stats": {
    "total_redacted": 5,
    "types": {"姓名": 2, "手机号": 1, "地址": 1, "其他": 1}
  }
}

只输出JSON，不要其他内容。`;

async function desensitize(text) {
  const prompt = `请对以下聊天记录进行隐私脱敏：\n\n${text}`;
  const result = await analyze(prompt, { system: SYSTEM_PROMPT });

  return extractJson(result);
}

module.exports = { desensitize };
