# 项目汇报：AI 人格画像 & 虚拟好友

> 生成日期：2026-05-12

## 项目概述

基于 Claude API 的人格分析和虚拟好友生成系统。用户输入聊天记录或图片，系统自动脱敏后进行多维度人格分析，生成综合画像，并可基于画像创建虚拟好友进行陪聊。

## 技术栈

| 类别 | 技术 |
|------|------|
| 后端 | Node.js + Express 5 |
| AI | Anthropic Claude SDK (`claude-sonnet-4`) |
| 前端 | 原生 HTML / CSS / JS（无框架） |
| 文件上传 | Multer |
| 环境变量 | dotenv |

## 项目结构

```
a_sw/
├── server.js                 # Express 入口
├── package.json
├── .env / .env.example       # 环境配置
├── .gitignore
├── public/                   # 前端静态文件
│   ├── index.html
│   ├── app.js
│   └── style.css
├── src/
│   ├── config.js             # 配置读取
│   ├── utils/                # 工具函数
│   │   ├── parse-json.js     # AI 返回 JSON 提取（三级容错）
│   │   ├── data-store.js     # 数据文件读写（async）
│   │   └── validate.js       # 输入校验（UUID 等）
│   ├── routes/               # API 路由
│   │   ├── analysis.js       # 聊天/图片分析
│   │   ├── persona.js        # 人设创建/迭代
│   │   └── chat.js           # 陪聊接口
│   ├── services/             # 业务逻辑（11 个服务）
│   │   ├── claude.js         # Claude API 封装
│   │   ├── privacy.js        # 隐私脱敏
│   │   ├── language-style.js
│   │   ├── values-emotion.js
│   │   ├── social-behavior.js
│   │   ├── portrait-analysis.js
│   │   ├── scene-analysis.js
│   │   ├── personality.js
│   │   ├── persona-gen.js
│   │   ├── persona-iterate.js
│   │   └── persona-chat.js
│   └── prompts/              # AI Prompt 模板（9 个 .md 文件）
├── figma/                    # Figma 设计系统参考
├── tests/                    # 测试目录（空）
└── uploads/                  # 上传临时目录
```

## 核心功能流程

| 阶段 | 功能 | API |
|------|------|-----|
| S1 | 聊天记录隐私脱敏 | `POST /api/analyze/chat` |
| S2 | 语言风格分析 | S1 内并行执行 |
| S3 | 三观情绪分析 | S1 内并行执行 |
| S4 | 社交行为分析 | S1 内并行执行 |
| S5 | 人像图片分析 | `POST /api/analyze/image` |
| S6 | 场景图片分析 | `POST /api/analyze/image` |
| S7 | 综合人格画像构建 | `POST /api/profile/build` |
| S8 | 虚拟好友人设生成 | `POST /api/persona/create` |
| S9 | 沉浸式陪聊 | `POST /api/chat` |
| S10 | 人设迭代优化 | `POST /api/persona/iterate` |

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| POST | `/api/analyze/chat` | 聊天记录分析（自动脱敏 + S2~S4） |
| POST | `/api/analyze/image` | 图片分析（S5 或 S6，支持文件上传或文本描述） |
| POST | `/api/profile/build` | 构建综合人格画像（S7） |
| POST | `/api/persona/create` | 生成虚拟好友人设（S8） |
| POST | `/api/persona/iterate` | 人设迭代优化（S10） |
| GET | `/api/persona/:id` | 获取人设 |
| GET | `/api/persona/profile/:id` | 获取画像 |
| POST | `/api/chat` | 沉浸式陪聊（S9） |

## 前端页面

| 页面 | 功能 |
|------|------|
| 聊天分析 | 粘贴聊天记录，自动脱敏并分析语言风格、三观情绪、社交行为 |
| 图片分析 | 上传人像/场景图片或输入描述，进行性格洞察 |
| 人格画像 | 展示大五人格、MBTI 倾向、核心特质、优势与挑战、标签云 |
| 虚拟好友 | 展示基于画像生成的虚拟好友人设详情 |
| 陪聊 | 与虚拟好友进行沉浸式对话 |

## 依赖项

```json
{
  "@anthropic-ai/sdk": "^0.95.2",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "multer": "^2.1.1",
  "uuid": "^14.0.0"
}
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `ANTHROPIC_API_KEY` | Claude API 密钥 | — |
| `ANTHROPIC_BASE_URL` | API 基础 URL（可选） | — |
| `ANTHROPIC_MODEL` | 模型名称 | `claude-sonnet-4-20250514` |
| `PORT` | 服务端口 | `3000` |

## 质量改进记录（2026-05-12）

### 1. JSON 解析容错

- **问题**：9 个 service 使用 `result.match(/\{[\s\S]*\}/)` 裸解析，无 JSON 时直接崩溃，嵌套大括号时匹配错误
- **方案**：新建 `src/utils/parse-json.js`，三级容错策略：` ```json ``` ` 代码块提取 → 贪婪匹配 → 逐字符大括号匹配
- **范围**：privacy / language-style / values-emotion / social-behavior / personality / persona-gen / persona-iterate / portrait-analysis / scene-analysis（共 9 个 service）

### 2. 消除 loadPersona 重复定义

- **问题**：`loadPersona` 在 `persona.js` 和 `chat.js` 中完全重复定义；`personality.js` 内联了 `saveProfile` 逻辑
- **方案**：新建 `src/utils/data-store.js`，集中 `savePersona` / `loadPersona` / `saveProfile` / `loadProfile` 四个函数
- **范围**：persona.js / chat.js / personality.js

### 3. System Prompt 生效

- **问题**：`privacy.js` 定义了 `SYSTEM_PROMPT` 但从未作为 system prompt 传入 Claude API
- **方案**：`claude.js` 的 `analyze()` 新增 `system` 选项，`privacy.js` 传入 `{ system: SYSTEM_PROMPT }`
- **范围**：claude.js / privacy.js

### 4. 异步文件 I/O

- **问题**：`data-store.js` 和 `analysis.js` 使用同步 fs 操作，阻塞 Node.js 事件循环
- **方案**：`data-store.js` 全部改为 `fs.promises`；`analysis.js` 上传文件读取改为 `fs.promises.readFile`；路由层全部 `await`
- **范围**：data-store.js / analysis.js / persona.js / chat.js / personality.js

### 5. 上传文件清理保护

- **问题**：`analysis.js` 中 `fs.unlink` 失败会导致已成功的分析请求返回 500
- **方案**：`fs.unlink` 改为 fire-and-forget（`.catch(() => {})`），清理失败不影响响应

### 6. 输入校验

- **问题**：所有路由缺乏输入校验，存在超长文本、非法 ID、路径注入等风险
- **方案**：新建 `src/utils/validate.js`（UUID 校验），各路由内联校验
- **校验项**：

| 路由 | 校验内容 |
|------|----------|
| `POST /api/analyze/chat` | `text` 长度 ≤ 50000 字符 |
| `POST /api/analyze/image` | `type` 白名单 `portrait` / `scene` |
| `POST /api/persona/iterate` | `persona_id` UUID 格式 |
| `GET /api/persona/:id` | `:id` UUID 格式 |
| `GET /api/profile/:id` | `:id` UUID 格式 |
| `POST /api/chat` | `persona_id` UUID 格式、`message` 长度 ≤ 10000、`history` 结构校验 |

### 7. API 超时

- **问题**：Claude API 调用无超时设置，API 卡住时请求永不返回
- **方案**：Anthropic SDK 客户端设置 `timeout: 120000`（120 秒），`analyze()` 和 `chat()` 均生效

## 当前状态

- **Git 仓库**：未初始化
- **测试**：`tests/` 目录为空，无测试文件
- **依赖**：已安装（`package-lock.json` 存在，`node_modules` 已就绪）
- **设计参考**：`figma/DESIGN.md` 包含完整 Figma 设计系统文档（~580 行）
- **前端**：5 个页面功能完整
- **数据持久化**：JSON 文件存储于 `src/data/personas/` 和 `src/data/profiles/`
- **工具函数**：`src/utils/` 包含 parse-json（JSON 提取）、data-store（数据读写）、validate（输入校验）
- **代码质量**：已完成 7 项质量改进（JSON 容错、去重、system prompt、异步 I/O、文件清理保护、输入校验、API 超时）
