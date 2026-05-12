const express = require('express');
const { chatWithPersona } = require('../services/persona-chat');
const { desensitize } = require('../services/privacy');
const { loadPersona } = require('../utils/data-store');
const { isValidUuid } = require('../utils/validate');

const router = express.Router();

// POST /api/chat — 沉浸式陪聊 (S9)
router.post('/', async (req, res) => {
  try {
    const { persona_id, message, history = [] } = req.body;
    if (!persona_id || !message) {
      return res.status(400).json({ error: '请提供persona_id和message' });
    }
    if (!isValidUuid(persona_id)) {
      return res.status(400).json({ error: 'persona_id 格式无效' });
    }
    if (message.length > 10000) {
      return res.status(400).json({ error: '消息过长，请控制在 10000 字符以内' });
    }
    if (!Array.isArray(history) || history.some(m => !m.role || !m.content)) {
      return res.status(400).json({ error: 'history 格式无效，每项需包含 role 和 content' });
    }

    const persona = await loadPersona(persona_id);
    if (!persona) return res.status(404).json({ error: '人设不存在' });

    // 用户消息先脱敏
    const privacyResult = await desensitize(message);
    const safeMessage = privacyResult.desensitized_text;

    const reply = await chatWithPersona(persona, safeMessage, history);

    res.json({
      reply,
      privacy: privacyResult.redacted_items.length > 0 ? privacyResult : undefined,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
