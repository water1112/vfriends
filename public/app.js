// State
let currentAnalysis = null;
let currentProfile = null;
let currentPersona = null;
let chatHistory = [];
let imageType = 'portrait';

// Navigation
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
}

function showLoading(text) {
  document.getElementById('loadingText').textContent = text;
  document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function renderTags(items, colorFn) {
  return items.map(item => {
    const cls = colorFn ? colorFn(item) : 'tag-primary';
    return `<span class="tag ${cls}">${item}</span>`;
  }).join('');
}

function renderKV(obj, keys) {
  return keys.map(k => {
    const label = k.label || k.key;
    const val = obj[k.key];
    const display = Array.isArray(val) ? renderTags(val, tagColor) : val;
    return `<div style="margin-bottom:12px"><span style="color:var(--muted);font-size:14px">${label}：</span><span>${display}</span></div>`;
  }).join('');
}

function tagColor() {
  const colors = ['tag-peach', 'tag-mint', 'tag-blue', 'tag-lavender', 'tag-gold'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// S1: 聊天分析
async function analyzeChat() {
  const text = document.getElementById('chatInput').value.trim();
  if (!text) return toast('请输入聊天记录');

  showLoading('正在脱敏并分析聊天记录...');
  try {
    const res = await fetch('/api/analyze/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    currentAnalysis = data;
    renderAnalysisResult(data);
    document.getElementById('analysisResult').style.display = 'block';
    toast('分析完成');
  } catch (e) {
    toast('分析失败: ' + e.message);
  } finally {
    hideLoading();
  }
}

function renderAnalysisResult(data) {
  // Privacy
  const priv = data.privacy;
  document.getElementById('privacyResult').innerHTML = `
    <div style="margin-bottom:8px">共脱敏 <strong>${priv.stats.total_redacted}</strong> 处</div>
    <div>${renderTags(Object.keys(priv.stats.types), () => 'tag-peach')}</div>
  `;

  // Language style
  const lang = data.analysis.languageStyle;
  document.getElementById('langResult').innerHTML = renderKV(lang, [
    { key: 'vocabulary_richness', label: '词汇丰富度' },
    { key: 'sentence_pattern', label: '句式特征' },
    { key: 'emoji_usage', label: '表情使用' },
    { key: 'humor_style', label: '幽默风格' },
    { key: 'expression_style', label: '表达方式' },
    { key: 'communication_role', label: '沟通角色' },
    { key: 'topics_of_interest', label: '兴趣话题' },
    { key: 'personality_tags', label: '个性标签' },
  ]);

  // Values & emotion
  const emo = data.analysis.valuesEmotion;
  document.getElementById('emotionResult').innerHTML = renderKV(emo, [
    { key: 'core_values', label: '核心价值观' },
    { key: 'emotional_stability', label: '情绪稳定性' },
    { key: 'empathy_level', label: '共情能力' },
    { key: 'decision_style', label: '决策风格' },
    { key: 'risk_preference', label: '风险偏好' },
    { key: 'life_attitude_tags', label: '人生态度' },
  ]);

  // Social behavior
  const social = data.analysis.socialBehavior;
  document.getElementById('socialResult').innerHTML = renderKV(social, [
    { key: 'social_initiative', label: '社交主动性' },
    { key: 'relationship_maintenance', label: '关系维护' },
    { key: 'conflict_handling', label: '冲突处理' },
    { key: 'trust_building_speed', label: '信任建立' },
    { key: 'boundary_sense', label: '边界感' },
    { key: 'group_role', label: '群体角色' },
    { key: 'social_style_tags', label: '社交风格' },
  ]);
}

function clearChat() {
  document.getElementById('chatInput').value = '';
  document.getElementById('analysisResult').style.display = 'none';
  currentAnalysis = null;
}

// S7: 构建综合画像
async function buildProfile() {
  if (!currentAnalysis) return toast('请先分析聊天记录');

  showLoading('正在生成综合人格画像...');
  try {
    const res = await fetch('/api/profile/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analyses: currentAnalysis.analysis }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    currentProfile = data;
    renderProfile(data);
    showPage('profile');
    toast('画像生成完成');
  } catch (e) {
    toast('画像生成失败: ' + e.message);
  } finally {
    hideLoading();
  }
}

function renderProfile(profile) {
  document.getElementById('profileEmpty').style.display = 'none';
  document.getElementById('profileDisplay').style.display = 'block';

  // Big Five
  const bf = profile.big_five;
  const bfColors = {
    openness: 'var(--lavender)',
    conscientiousness: 'var(--mint)',
    extraversion: 'var(--peach)',
    agreeableness: 'var(--blue)',
    neuroticism: 'var(--gold)',
  };
  const bfLabels = {
    openness: '开放性',
    conscientiousness: '尽责性',
    extraversion: '外向性',
    agreeableness: '宜人性',
    neuroticism: '神经质',
  };
  document.getElementById('bigFive').innerHTML = Object.entries(bf).map(([k, v]) => `
    <div class="big-five-bar">
      <span class="big-five-label">${bfLabels[k]}</span>
      <div class="big-five-track">
        <div class="big-five-fill" style="width:${v * 10}%;background:${bfColors[k]}"></div>
      </div>
      <span class="big-five-value">${v}</span>
    </div>
  `).join('');

  // MBTI
  document.getElementById('mbtiResult').textContent = profile.mbti_tendency || '-';

  // Core traits
  document.getElementById('coreTraits').innerHTML = renderTags(profile.core_traits || [], () => 'tag-lavender');

  // Strengths
  document.getElementById('strengths').innerHTML = (profile.strengths || [])
    .map(s => `<div style="margin-bottom:8px;padding:8px 12px;background:var(--surface-soft);border-radius:var(--radius-sm)">${s}</div>`).join('');

  // Challenges
  document.getElementById('challenges').innerHTML = (profile.challenges || [])
    .map(c => `<div style="margin-bottom:8px;padding:8px 12px;background:var(--surface-soft);border-radius:var(--radius-sm)">${c}</div>`).join('');

  // Summary
  document.getElementById('summary').textContent = profile.summary || '';

  // Tags
  document.getElementById('tagCloud').innerHTML = renderTags(profile.tags || [], () => {
    const colors = ['tag-peach', 'tag-mint', 'tag-blue', 'tag-lavender', 'tag-gold'];
    return colors[Math.floor(Math.random() * colors.length)];
  });
}

// S5/S6: 图片分析
function setImageType(type) {
  imageType = type;
  document.getElementById('btnPortrait').className = type === 'portrait' ? 'btn btn-primary' : 'btn btn-secondary';
  document.getElementById('btnScene').className = type === 'scene' ? 'btn btn-primary' : 'btn btn-secondary';
}

async function analyzeImage() {
  const file = document.getElementById('imageFile').files[0];
  const desc = document.getElementById('imageDesc').value.trim();

  if (!file && !desc) return toast('请上传图片或输入描述');

  showLoading('正在分析图片...');
  try {
    const formData = new FormData();
    formData.append('type', imageType);
    if (file) formData.append('image', file);
    if (desc) formData.append('description', desc);

    const res = await fetch('/api/analyze/image', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    document.getElementById('imageResult').style.display = 'block';
    const keys = imageType === 'portrait'
      ? [
          { key: 'temperament', label: '气质类型' },
          { key: 'expression_tendency', label: '表情倾向' },
          { key: 'age_range', label: '年龄段' },
          { key: 'style_tags', label: '风格标签' },
          { key: 'personality_inferences', label: '性格推断' },
        ]
      : [
          { key: 'lifestyle', label: '生活方式' },
          { key: 'aesthetic_preference', label: '审美偏好' },
          { key: 'personality_orientation', label: '性格倾向' },
          { key: 'interest_domains', label: '兴趣领域' },
          { key: 'life_attitude_tags', label: '生活态度' },
        ];
    document.getElementById('imageResultContent').innerHTML = renderKV(data, keys);
    toast('图片分析完成');
  } catch (e) {
    toast('分析失败: ' + e.message);
  } finally {
    hideLoading();
  }
}

// S8: 生成虚拟好友
async function createPersona() {
  if (!currentProfile) return toast('请先生成人格画像');

  showLoading('正在设计虚拟好友...');
  try {
    const res = await fetch('/api/persona/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: currentProfile }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    currentPersona = data;
    renderPersona(data);
    showPage('persona');
    toast('虚拟好友已创建');
  } catch (e) {
    toast('创建失败: ' + e.message);
  } finally {
    hideLoading();
  }
}

function renderPersona(persona) {
  document.getElementById('personaEmpty').style.display = 'none';
  document.getElementById('personaDisplay').style.display = 'block';

  document.getElementById('personaAvatar').textContent = persona.name[0];
  document.getElementById('personaName').textContent = persona.name;
  document.getElementById('personaAge').textContent = `${persona.age} 岁`;

  document.getElementById('personaInfo').innerHTML = `
    <div style="margin-bottom:16px">
      <div style="color:var(--muted);font-size:14px;margin-bottom:4px">性格</div>
      <div>${persona.personality}</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="color:var(--muted);font-size:14px;margin-bottom:4px">说话风格</div>
      <div>${persona.speaking_style}</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="color:var(--muted);font-size:14px;margin-bottom:4px">背景故事</div>
      <div>${persona.background_story}</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="color:var(--muted);font-size:14px;margin-bottom:4px">互动模式</div>
      <div>${persona.relationship_dynamic}</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="color:var(--muted);font-size:14px;margin-bottom:4px">兴趣爱好</div>
      <div>${renderTags(persona.interests || [], () => 'tag-mint')}</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="color:var(--muted);font-size:14px;margin-bottom:4px">口头禅</div>
      <div>${(persona.catchphrases || []).map(c => `"${c}"`).join('、')}</div>
    </div>
    <div>
      <div style="color:var(--muted);font-size:14px;margin-bottom:4px">边界设定</div>
      <div>${(persona.boundaries || []).map(b => `<div style="padding:4px 0">· ${b}</div>`).join('')}</div>
    </div>
  `;
}

// S9: 陪聊
function startChat() {
  if (!currentPersona) return toast('请先创建虚拟好友');

  chatHistory = [];
  document.getElementById('chatMessages').innerHTML = '';
  document.getElementById('chatAvatar').textContent = currentPersona.name[0];
  document.getElementById('chatName').textContent = currentPersona.name;

  // 自动开场白
  addMessage('persona', `嗨～我是${currentPersona.name}，很高兴认识你！`);

  showPage('chat');
}

function addMessage(role, text) {
  const container = document.getElementById('chatMessages');
  // 移除占位文字
  if (container.querySelector('div[style*="text-align:center"]')) {
    container.innerHTML = '';
  }

  const div = document.createElement('div');
  div.className = `msg msg-${role}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;

  chatHistory.push({ role: role === 'user' ? 'user' : 'assistant', content: text });
}

async function sendMessage() {
  const input = document.getElementById('chatMsgInput');
  const msg = input.value.trim();
  if (!msg || !currentPersona) return;

  input.value = '';
  addMessage('user', msg);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        persona_id: currentPersona.persona_id,
        message: msg,
        history: chatHistory.slice(0, -1),
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    addMessage('persona', data.reply);
  } catch (e) {
    toast('发送失败: ' + e.message);
  }
}

// S10: 人设迭代
async function iteratePersona() {
  if (!currentPersona || !currentAnalysis) return toast('需要人设和分析数据');

  showLoading('正在优化人设...');
  try {
    const res = await fetch('/api/persona/iterate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        persona_id: currentPersona.persona_id,
        new_analysis: currentAnalysis.analysis,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    currentPersona = data.persona;
    renderPersona(data.persona);

    const changes = (data.changes || []).map(c => `${c.field}: ${c.old_value} → ${c.new_value}`).join('\n');
    toast(`人设已迭代 (${data.confidence})`);
    if (changes) alert('变更详情：\n' + changes);
  } catch (e) {
    toast('迭代失败: ' + e.message);
  } finally {
    hideLoading();
  }
}
