const express = require('express');
const fs = require('fs').promises;
const multer = require('multer');
const { desensitize } = require('../services/privacy');
const { analyzeLanguageStyle } = require('../services/language-style');
const { analyzeValuesEmotion } = require('../services/values-emotion');
const { analyzeSocialBehavior } = require('../services/social-behavior');
const { analyzePortrait } = require('../services/portrait-analysis');
const { analyzeScene } = require('../services/scene-analysis');
const { buildProfile } = require('../services/personality');

const router = express.Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/analyze/chat — 聊天记录分析（自动脱敏 + S2~S4）
router.post('/chat', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: '请提供聊天记录文本' });
    if (text.length > 50000) return res.status(400).json({ error: '聊天记录过长，请控制在 50000 字符以内' });

    // S1: 隐私脱敏
    const privacyResult = await desensitize(text);
    const desensitizedText = privacyResult.desensitized_text;

    // S2~S4: 并行分析
    const [languageStyle, valuesEmotion, socialBehavior] = await Promise.all([
      analyzeLanguageStyle(desensitizedText),
      analyzeValuesEmotion(desensitizedText),
      analyzeSocialBehavior(desensitizedText),
    ]);

    res.json({
      privacy: privacyResult,
      analysis: { languageStyle, valuesEmotion, socialBehavior },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analyze/image — 图片分析（S5 或 S6）
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    const { type, description } = req.body;
    if (type && !['portrait', 'scene'].includes(type)) {
      return res.status(400).json({ error: 'type 必须为 portrait 或 scene' });
    }
    let imageInput;

    if (req.file) {
      const base64 = await fs.readFile(req.file.path, 'base64');
      const ext = req.file.originalname.split('.').pop().toLowerCase();
      const mediaTypes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' };
      imageInput = { base64, mediaType: mediaTypes[ext] || 'image/jpeg' };
      fs.unlink(req.file.path).catch(() => {});
    } else if (description) {
      imageInput = { description };
    } else {
      return res.status(400).json({ error: '请上传图片或提供图片描述' });
    }

    const result = type === 'scene'
      ? await analyzeScene(imageInput)
      : await analyzePortrait(imageInput);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/profile/build — 构建综合人格画像 (S7)
router.post('/build', async (req, res) => {
  try {
    const { analyses } = req.body;
    if (!analyses) return res.status(400).json({ error: '请提供分析数据' });

    const profile = await buildProfile(analyses);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
