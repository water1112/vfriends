const express = require('express');
const { createPersona } = require('../services/persona-gen');
const { iteratePersona } = require('../services/persona-iterate');
const { savePersona, loadPersona, saveProfile, loadProfile } = require('../utils/data-store');
const { isValidUuid } = require('../utils/validate');

const router = express.Router();

// POST /api/persona/create — 生成虚拟好友人设 (S8)
router.post('/create', async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) return res.status(400).json({ error: '请提供人格画像数据' });

    const persona = await createPersona(profile);
    await savePersona(persona);
    res.json(persona);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/persona/iterate — 人设迭代优化 (S10)
router.post('/iterate', async (req, res) => {
  try {
    const { persona_id, new_analysis } = req.body;
    if (!persona_id || !new_analysis) {
      return res.status(400).json({ error: '请提供persona_id和new_analysis' });
    }
    if (!isValidUuid(persona_id)) {
      return res.status(400).json({ error: 'persona_id 格式无效' });
    }

    const persona = await loadPersona(persona_id);
    if (!persona) return res.status(404).json({ error: '人设不存在' });

    const updated = await iteratePersona(persona, new_analysis);
    await savePersona(updated.persona);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/persona/:id — 获取人设
router.get('/:id', async (req, res) => {
  try {
    if (!isValidUuid(req.params.id)) return res.status(400).json({ error: 'id 格式无效' });
    const persona = await loadPersona(req.params.id);
    if (!persona) return res.status(404).json({ error: '人设不存在' });
    res.json(persona);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/profile/:id — 获取画像
router.get('/profile/:id', async (req, res) => {
  try {
    if (!isValidUuid(req.params.id)) return res.status(400).json({ error: 'id 格式无效' });
    const profile = await loadProfile(req.params.id);
    if (!profile) return res.status(404).json({ error: '画像不存在' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
