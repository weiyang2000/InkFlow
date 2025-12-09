# Project InkFlow - 技术架构设计文档

## 1. 技术选型决策

### 1.1 前端技术栈

| 类别 | 选型 | 理由 |
|-----|------|------|
| 框架 | Next.js 14 (App Router) | SSR/SSG支持、API Routes、流式渲染 |
| UI库 | Tailwind CSS + Shadcn/ui | 高度可定制、无运行时、设计一致性 |
| 状态管理 | Zustand | 轻量(~2KB)、TypeScript友好、简单API |
| 富文本编辑器 | TipTap v2 | 基于ProseMirror、高度可扩展、协作能力 |
| 脑图/流程图 | ReactFlow | React原生、性能优秀、定制灵活 |
| 表单处理 | React Hook Form + Zod | 类型安全、性能优化 |
| HTTP客户端 | TanStack Query | 缓存、重试、SSE支持 |

### 1.2 后端技术栈

| 类别 | 选型 | 理由 |
|-----|------|------|
| 框架 | FastAPI | 异步高性能、自动OpenAPI文档、类型提示 |
| ORM | SQLAlchemy 2.0 + Alembic | 成熟稳定、迁移管理 |
| 主数据库 | PostgreSQL 16 | JSONB支持、全文搜索、可靠性 |
| 向量数据库 | Chroma (开发) / Qdrant (生产) | 轻量易部署、性能优秀 |
| 图数据库 | Neo4j | GraphRAG核心、Cypher查询、可视化工具 |
| 缓存 | Redis | 会话、热数据缓存、实时队列 |
| 任务队列 | Celery + Redis | 异步归档、批量处理 |

### 1.3 AI/LLM 集成

| 层级 | 服务 |
|-----|------|
| 主力模型 | Claude 3.5 Sonnet / GPT-4o |
| 经济模型 | DeepSeek-V3 / Qwen-Max |
| Embedding | text-embedding-3-small / bge-large-zh |
| 路由层 | LiteLLM (统一多模型接口) |

---

## 2. 系统架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Next.js 14 Frontend                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Editor  │  │  Outline │  │   Wiki   │  │ Dashboard │            │
│  │ (TipTap) │  │(ReactFlow)│  │  Module  │  │          │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Zustand Store                             │   │
│  │  (novels, chapters, characters, settings, ui, auth)         │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                         API Routes │ SSE Streaming
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    API Routers                                │  │
│  │  /auth  /novels  /chapters  /wiki  /ai  /export              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │  RAG Service   │  │ GraphRAG Svc   │  │ Archive Agent  │       │
│  │ (Vector Search)│  │ (Neo4j Query)  │  │ (Auto Update)  │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   LLM Router (LiteLLM)                        │  │
│  │    Claude | GPT-4o | DeepSeek | Qwen                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│    PostgreSQL      │  │   Chroma/Qdrant    │  │      Neo4j         │
│  (Main Database)   │  │  (Vector Store)    │  │ (Knowledge Graph)  │
│                    │  │                    │  │                    │
│  - Users           │  │  - Chapter Embeds  │  │  - Characters      │
│  - Novels          │  │  - Wiki Embeds     │  │  - Relationships   │
│  - Chapters        │  │  - Summaries       │  │  - Locations       │
│  - Wiki Entries    │  │                    │  │  - Items           │
└────────────────────┘  └────────────────────┘  └────────────────────┘
            │
            ▼
┌────────────────────┐
│       Redis        │
│  - Session Cache   │
│  - Hot Data        │
│  - Task Queue      │
└────────────────────┘
```

---

## 3. 前端目录结构

```
inkflow-web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证相关路由组
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/              # 仪表盘路由组
│   │   ├── dashboard/
│   │   │   └── page.tsx          # 作品列表
│   │   ├── novel/
│   │   │   ├── [novelId]/
│   │   │   │   ├── page.tsx      # 作品概览
│   │   │   │   ├── outline/
│   │   │   │   │   └── page.tsx  # 大纲编辑器
│   │   │   │   ├── editor/
│   │   │   │   │   └── page.tsx  # 主编辑器
│   │   │   │   ├── wiki/
│   │   │   │   │   ├── page.tsx  # 世界观百科
│   │   │   │   │   ├── characters/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── locations/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── items/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── graph/
│   │   │   │   │   └── page.tsx  # 关系图谱
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx  # 作品设置
│   │   │   └── new/
│   │   │       └── page.tsx      # 新建作品
│   │   └── layout.tsx            # 侧边栏布局
│   │
│   ├── api/                      # API Routes (BFF层)
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── novels/
│   │   │   └── route.ts
│   │   ├── ai/
│   │   │   ├── generate/
│   │   │   │   └── route.ts      # SSE流式生成
│   │   │   └── plan/
│   │   │       └── route.ts      # 策划模式
│   │   └── export/
│   │       └── route.ts
│   │
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页/Landing
│   └── globals.css
│
├── components/
│   ├── ui/                       # Shadcn/ui 基础组件
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   │
│   ├── editor/                   # 编辑器组件
│   │   ├── Editor.tsx            # 主编辑器容器
│   │   ├── EditorToolbar.tsx     # 工具栏
│   │   ├── EditorSidebar.tsx     # AI侧边栏
│   │   ├── SlashCommand.tsx      # 斜杠命令菜单
│   │   ├── AiSuggestion.tsx      # AI建议气泡
│   │   ├── extensions/           # TipTap扩展
│   │   │   ├── slash-command.ts
│   │   │   ├── ai-highlight.ts
│   │   │   └── wiki-link.ts
│   │   └── hooks/
│   │       ├── useEditor.ts
│   │       └── useAiGenerate.ts
│   │
│   ├── outline/                  # 大纲组件
│   │   ├── OutlineCanvas.tsx     # ReactFlow画布
│   │   ├── ChapterNode.tsx       # 章节节点
│   │   ├── OutlinePanel.tsx      # 侧边面板
│   │   └── RhythmHeatmap.tsx     # 节奏热力图
│   │
│   ├── wiki/                     # 世界观百科组件
│   │   ├── CharacterCard.tsx     # 人物卡片
│   │   ├── CharacterForm.tsx     # 人物编辑表单
│   │   ├── RelationshipGraph.tsx # 关系图谱
│   │   ├── LocationCard.tsx      # 地点卡片
│   │   ├── ItemCard.tsx          # 物品卡片
│   │   ├── TimelineView.tsx      # 状态时间线
│   │   └── WikiSearch.tsx        # 百科搜索
│   │
│   ├── ai/                       # AI交互组件
│   │   ├── AiChat.tsx            # Copilot聊天
│   │   ├── PlanSelector.tsx      # 策划选项卡
│   │   ├── WritingMode.tsx       # 写作模式选择
│   │   └── ConsistencyAlert.tsx  # 一致性警告
│   │
│   ├── layout/                   # 布局组件
│   │   ├── Sidebar.tsx           # 主侧边栏
│   │   ├── Header.tsx            # 顶部导航
│   │   ├── NovelTabs.tsx         # 作品内标签页
│   │   └── ResizablePanel.tsx    # 可调整面板
│   │
│   └── shared/                   # 通用组件
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       ├── ConfirmDialog.tsx
│       └── ErrorBoundary.tsx
│
├── lib/
│   ├── api/                      # API客户端
│   │   ├── client.ts             # Axios/Fetch封装
│   │   ├── novels.ts
│   │   ├── chapters.ts
│   │   ├── wiki.ts
│   │   └── ai.ts
│   │
│   ├── hooks/                    # 自定义Hooks
│   │   ├── useNovel.ts
│   │   ├── useChapter.ts
│   │   ├── useWiki.ts
│   │   ├── useAiStream.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── store/                    # Zustand stores
│   │   ├── index.ts              # Store导出
│   │   ├── novelStore.ts         # 作品状态
│   │   ├── editorStore.ts        # 编辑器状态
│   │   ├── wikiStore.ts          # 百科状态
│   │   ├── uiStore.ts            # UI状态
│   │   └── authStore.ts          # 认证状态
│   │
│   ├── utils/                    # 工具函数
│   │   ├── cn.ts                 # className合并
│   │   ├── format.ts             # 格式化
│   │   ├── export.ts             # 导出工具
│   │   └── validation.ts         # 校验
│   │
│   └── types/                    # TypeScript类型
│       ├── novel.ts
│       ├── chapter.ts
│       ├── character.ts
│       ├── wiki.ts
│       ├── ai.ts
│       └── api.ts
│
├── public/
│   ├── fonts/
│   ├── images/
│   └── icons/
│
├── styles/
│   └── editor.css                # 编辑器专用样式
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

---

## 4. 数据模型设计

### 4.1 PostgreSQL 核心表

```sql
-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    avatar_url TEXT,
    subscription_tier VARCHAR(20) DEFAULT 'free', -- free, pro, enterprise
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 小说/作品表
CREATE TABLE novels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(50), -- 玄幻, 言情, 科幻...
    cover_url TEXT,
    word_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft', -- draft, publishing, completed
    settings JSONB DEFAULT '{}', -- AI设置、写作偏好
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 卷表
CREATE TABLE volumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 章节表
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
    volume_id UUID REFERENCES volumes(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT, -- 正文内容(HTML/Markdown)
    summary TEXT, -- AI生成的摘要
    word_count INTEGER DEFAULT 0,
    sort_order INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- draft, published
    outline_data JSONB DEFAULT '{}', -- 大纲节点数据
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 人物表
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    aliases TEXT[], -- 别名列表
    avatar_url TEXT,
    description TEXT,
    personality TEXT, -- 性格描述
    background TEXT, -- 背景故事
    attributes JSONB DEFAULT '{}', -- 自定义属性
    first_appearance_chapter UUID REFERENCES chapters(id),
    is_protagonist BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 人物状态变更表 (动态状态流)
CREATE TABLE character_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    state_type VARCHAR(50), -- appearance, ability, status, location
    state_key VARCHAR(100), -- 具体属性键
    state_value TEXT, -- 属性值
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 人物关系表
CREATE TABLE character_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
    from_character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    to_character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50), -- family, friend, enemy, lover...
    description TEXT,
    strength INTEGER DEFAULT 50, -- 0-100 关系强度
    established_chapter UUID REFERENCES chapters(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 地点表
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES locations(id), -- 层级地点
    description TEXT,
    environment_keywords TEXT[], -- 环境关键词供AI调用
    map_data JSONB DEFAULT '{}', -- 地图坐标等
    created_at TIMESTAMP DEFAULT NOW()
);

-- 物品/功法表
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- weapon, artifact, skill, technique
    description TEXT,
    attributes JSONB DEFAULT '{}', -- 属性详情
    owner_id UUID REFERENCES characters(id), -- 当前持有者
    first_appearance_chapter UUID REFERENCES chapters(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 设定集(通用词条)
CREATE TABLE wiki_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
    category VARCHAR(50), -- system, rule, faction, event
    title VARCHAR(255) NOT NULL,
    content TEXT,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 变更日志表(逆向归档)
CREATE TABLE change_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id),
    change_type VARCHAR(50), -- character_update, item_acquired, relationship_change
    entity_type VARCHAR(50), -- character, item, location
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    description TEXT,
    is_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 索引优化
CREATE INDEX idx_chapters_novel ON chapters(novel_id);
CREATE INDEX idx_characters_novel ON characters(novel_id);
CREATE INDEX idx_character_states_chapter ON character_states(chapter_id);
CREATE INDEX idx_wiki_novel_category ON wiki_entries(novel_id, category);
CREATE INDEX idx_change_logs_novel ON change_logs(novel_id, is_confirmed);
```

### 4.2 Neo4j 图数据模型

```cypher
// 节点类型
(:Character {id, name, novel_id})
(:Location {id, name, novel_id})
(:Item {id, name, novel_id})
(:Faction {id, name, novel_id})
(:Event {id, name, chapter_id, novel_id})

// 关系类型
(:Character)-[:KNOWS {type, strength, since_chapter}]->(:Character)
(:Character)-[:OWNS {acquired_chapter}]->(:Item)
(:Character)-[:LOCATED_AT {chapter_id}]->(:Location)
(:Character)-[:BELONGS_TO]->(:Faction)
(:Character)-[:PARTICIPATED_IN]->(:Event)
(:Location)-[:PART_OF]->(:Location)
(:Item)-[:EFFECTIVE_AGAINST {reason}]->(:Character)
(:Character)-[:FEARS {reason}]->(:Character|Item|Location)
(:Character)-[:WEAKNESS]->(:Item|Concept)

// 示例查询：找出击败赵无极的可行路径
MATCH path = (hero:Character {name: '林默'})-[*1..3]-(weakness)-[*1..2]->(enemy:Character {name: '赵无极'})
WHERE any(r in relationships(path) WHERE type(r) IN ['FEARS', 'WEAKNESS', 'EFFECTIVE_AGAINST'])
RETURN path
```

### 4.3 向量数据库 Schema

```python
# Chroma/Qdrant Collection结构

# 章节内容向量
collection: "chapter_embeddings"
- id: str (chapter_id + chunk_index)
- embedding: float[1536]  # text-embedding-3-small
- metadata:
    - novel_id: str
    - chapter_id: str
    - chunk_index: int
    - content: str (原文片段)
    - characters_mentioned: list[str]  # 提及的人物
    - locations_mentioned: list[str]   # 提及的地点

# 设定/百科向量
collection: "wiki_embeddings"
- id: str (wiki_entry_id)
- embedding: float[1536]
- metadata:
    - novel_id: str
    - category: str
    - title: str
    - content: str
    - entity_id: str (可选，关联实体ID)
```

---

## 5. API 接口设计

### 5.1 RESTful API

```yaml
# 认证
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/me

# 小说管理
GET    /api/novels                    # 获取用户所有小说
POST   /api/novels                    # 创建小说
GET    /api/novels/:id                # 获取小说详情
PUT    /api/novels/:id                # 更新小说
DELETE /api/novels/:id                # 删除小说

# 章节管理
GET    /api/novels/:novelId/chapters  # 获取章节列表
POST   /api/novels/:novelId/chapters  # 创建章节
GET    /api/chapters/:id              # 获取章节详情
PUT    /api/chapters/:id              # 更新章节
DELETE /api/chapters/:id              # 删除章节
POST   /api/chapters/:id/save         # 保存并触发归档

# 世界观百科
GET    /api/novels/:novelId/wiki      # 获取所有百科条目
GET    /api/novels/:novelId/characters
POST   /api/novels/:novelId/characters
GET    /api/characters/:id
PUT    /api/characters/:id
DELETE /api/characters/:id

GET    /api/novels/:novelId/locations
POST   /api/novels/:novelId/locations
# ... 类似CRUD

GET    /api/novels/:novelId/items
POST   /api/novels/:novelId/items

GET    /api/novels/:novelId/wiki-entries
POST   /api/novels/:novelId/wiki-entries

# 关系图谱
GET    /api/novels/:novelId/graph     # 获取完整关系图
POST   /api/novels/:novelId/relationships
PUT    /api/relationships/:id
DELETE /api/relationships/:id

# 变更日志
GET    /api/novels/:novelId/changes   # 获取待确认变更
POST   /api/changes/:id/confirm       # 确认变更
POST   /api/changes/:id/reject        # 拒绝变更

# 导出
POST   /api/novels/:novelId/export    # 导出为docx/pdf/epub
```

### 5.2 AI 流式接口 (SSE)

```yaml
# AI续写 (流式)
POST /api/ai/generate
Request:
  {
    "novelId": "uuid",
    "chapterId": "uuid",
    "mode": "plot" | "atmosphere" | "comedy",
    "instruction": "续写战斗场面",
    "contextLength": 3000,  # 前文字数
    "planId": "uuid"        # 可选，如果已选择策划方案
  }
Response: SSE stream
  event: token
  data: {"content": "风"}

  event: token
  data: {"content": "像是被撕裂的帛..."}

  event: done
  data: {"wordCount": 500, "tokensUsed": 1200}

# AI策划 (导演模式Phase 1)
POST /api/ai/plan
Request:
  {
    "novelId": "uuid",
    "chapterId": "uuid",
    "instruction": "林默如何逃脱"
  }
Response:
  {
    "plans": [
      {"id": "1", "title": "直接开战", "description": "..."},
      {"id": "2", "title": "潜行绕后", "description": "..."},
      {"id": "3", "title": "触发意外事件", "description": "..."}
    ]
  }

# AI局部重绘
POST /api/ai/rewrite
Request:
  {
    "novelId": "uuid",
    "chapterId": "uuid",
    "selectedText": "原文...",
    "style": "vivid" | "concise" | "first_person"
  }
Response: SSE stream

# AI对话 (Copilot)
POST /api/ai/chat
Request:
  {
    "novelId": "uuid",
    "chapterId": "uuid",
    "messages": [
      {"role": "user", "content": "林默的性格特点是什么？"}
    ]
  }
Response: SSE stream

# RAG搜索
POST /api/ai/search
Request:
  {
    "novelId": "uuid",
    "query": "关于龙渊剑的设定",
    "limit": 5
  }
Response:
  {
    "results": [
      {
        "type": "wiki",
        "title": "龙渊剑",
        "content": "...",
        "score": 0.92
      },
      {
        "type": "chapter",
        "chapterTitle": "第10章",
        "content": "...描写片段...",
        "score": 0.87
      }
    ]
  }
```

---

## 6. MVP 分阶段实施计划

### Phase 1: 基础框架 (Week 1-2)
- [x] Next.js项目初始化
- [ ] Shadcn/ui组件库集成
- [ ] 用户认证(NextAuth)
- [ ] 基础布局和路由
- [ ] PostgreSQL数据库连接
- [ ] 小说/章节CRUD API

### Phase 2: 智能编辑器 (Week 3-4)
- [ ] TipTap编辑器集成
- [ ] 基础工具栏(格式化、字数统计)
- [ ] 自动保存功能
- [ ] LLM集成(基础续写)
- [ ] SSE流式响应

### Phase 3: 世界观百科 (Week 5-6)
- [ ] 人物管理CRUD
- [ ] 地点/物品管理
- [ ] 设定集管理
- [ ] 向量数据库集成(Chroma)
- [ ] 基础RAG检索

### Phase 4: 增强AI能力 (Week 7-8)
- [ ] Slash Command交互
- [ ] 多模式续写(剧情/氛围/沙雕)
- [ ] 局部重绘功能
- [ ] Copilot侧边栏
- [ ] 策划模式(Plan-Execute)

### Phase 5: GraphRAG & 自动归档 (Week 9-10)
- [ ] Neo4j集成
- [ ] 关系图谱可视化
- [ ] 图谱查询增强
- [ ] 自动逆向归档Agent
- [ ] 变更确认流程

### Phase 6: 大纲与高级功能 (Week 11-12)
- [ ] ReactFlow大纲编辑器
- [ ] 节奏热力图
- [ ] 导出功能(docx/pdf/epub)
- [ ] 会员体系
- [ ] 性能优化

---

## 7. 环境变量配置

```env
# .env.local

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/inkflow
REDIS_URL=redis://localhost:6379

# Vector DB
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# Auth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# LLM APIs
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
DEEPSEEK_API_KEY=sk-xxx

# Feature Flags
ENABLE_GRAPHRAG=false
ENABLE_AUTO_ARCHIVE=false
```

---

## 8. 部署架构

### 开发环境
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    ports: ["5432:5432"]

  redis:
    image: redis:7
    ports: ["6379:6379"]

  chroma:
    image: chromadb/chroma
    ports: ["8000:8000"]

  neo4j:
    image: neo4j:5
    ports: ["7474:7474", "7687:7687"]
```

### 生产环境
- **Frontend**: Vercel (自动CI/CD)
- **Backend**: Railway / Render / AWS ECS
- **Database**: Supabase (PostgreSQL) / Neon
- **Vector DB**: Qdrant Cloud
- **Graph DB**: Neo4j AuraDB
- **Cache**: Upstash Redis
