// Writing Prompts for different modes

import type { WritingMode } from '@/lib/types'

/**
 * Base system prompt for novel writing
 */
export const BASE_SYSTEM_PROMPT = `你是一位专业的网络小说作家，擅长创作引人入胜的故事。你的写作风格流畅自然，善于把握节奏，能够写出让读者欲罢不能的内容。

写作要求：
1. 保持故事的连贯性和逻辑性
2. 人物性格要鲜明，对话要生动
3. 适当运用环境描写和心理描写
4. 避免过于直白的叙述，多用"展示"而非"讲述"
5. 输出纯小说内容，不要添加任何解释或评论`

/**
 * Get system prompt for specific writing mode
 */
export function getSystemPrompt(mode: WritingMode): string {
  const modePrompts: Record<WritingMode, string> = {
    plot: `${BASE_SYSTEM_PROMPT}

当前模式：剧情推进
重点：
- 推动故事情节发展
- 制造冲突和悬念
- 保持节奏紧凑
- 适当的对话推动剧情`,

    atmosphere: `${BASE_SYSTEM_PROMPT}

当前模式：氛围渲染
重点：
- 细腻的环境描写
- 深入的心理刻画
- 营造特定的情感氛围
- 使用比喻和意象增强画面感`,

    comedy: `${BASE_SYSTEM_PROMPT}

当前模式：轻松幽默
重点：
- 轻松诙谐的语言风格
- 有趣的对话和互动
- 适当的吐槽和梗
- 保持欢快的氛围`,

    battle: `${BASE_SYSTEM_PROMPT}

当前模式：战斗场景
重点：
- 激烈紧张的战斗描写
- 招式技能的细节展现
- 战斗节奏的把控
- 力量对比和形势变化`,

    romance: `${BASE_SYSTEM_PROMPT}

当前模式：感情戏
重点：
- 细腻的情感描写
- 人物间的化学反应
- 含蓄而有张力的表达
- 适当的心理活动`,

    dialogue: `${BASE_SYSTEM_PROMPT}

当前模式：对话生成
重点：
- 符合人物性格的对话
- 自然流畅的对话节奏
- 通过对话展现人物关系
- 适当的动作和神态描写`,

    rewrite: `${BASE_SYSTEM_PROMPT}

当前模式：润色重写
重点：
- 提升文字的表现力
- 优化句式和用词
- 增强画面感和感染力
- 保持原意的同时提升质量`,

    expand: `${BASE_SYSTEM_PROMPT}

当前模式：内容扩写
重点：
- 丰富细节描写
- 扩展情节内容
- 增加环境和心理描写
- 保持与原文风格一致`,
  }

  return modePrompts[mode] || modePrompts.plot
}

/**
 * Build user prompt for content generation
 */
export function buildGeneratePrompt(params: {
  previousContent: string
  instruction?: string
  mode: WritingMode
  characterContext?: string
  worldContext?: string
  chapterOutline?: string
  previousChapterSummary?: string
  locationContext?: string
  itemContext?: string
}): string {
  const {
    previousContent,
    instruction,
    characterContext,
    worldContext,
    chapterOutline,
    previousChapterSummary,
    locationContext,
    itemContext,
  } = params

  let prompt = ''

  // Add previous chapter summary for continuity
  if (previousChapterSummary) {
    prompt += `【上一章回顾】\n${previousChapterSummary}\n\n`
  }

  // Add chapter outline if available
  if (chapterOutline) {
    prompt += `【本章大纲】\n${chapterOutline}\n\n`
  }

  // Add context information if available
  if (characterContext) {
    prompt += `【相关人物设定】\n${characterContext}\n\n`
  }

  if (locationContext) {
    prompt += `【相关地点设定】\n${locationContext}\n\n`
  }

  if (itemContext) {
    prompt += `【相关物品设定】\n${itemContext}\n\n`
  }

  if (worldContext) {
    prompt += `【世界观设定】\n${worldContext}\n\n`
  }

  // Add previous content
  if (previousContent) {
    prompt += `【前文内容】\n${previousContent}\n\n`
  }

  // Add instruction
  if (instruction) {
    prompt += `【写作要求】\n${instruction}\n\n`
  }

  prompt += '请继续创作：'

  return prompt
}

/**
 * System prompt for story planning (Director Mode)
 */
export const PLAN_SYSTEM_PROMPT = `你是一位资深的小说策划编辑，擅长分析故事发展并提供多种可能的剧情走向。

你的任务是根据当前的故事内容，提供3个不同风格和走向的剧情方案供作者选择。

每个方案需要包含：
1. 简短的标题（不超过10个字）
2. 详细的剧情走向描述（50-100字）
3. 冲突程度评分（1-100，数值越高冲突越激烈）

请以JSON格式输出，格式如下：
{
  "plans": [
    {
      "id": "1",
      "title": "方案标题",
      "description": "详细描述",
      "conflictLevel": 80
    }
  ]
}`

/**
 * Build user prompt for story planning
 */
export function buildPlanPrompt(params: {
  previousContent: string
  instruction?: string
  characterContext?: string
}): string {
  const { previousContent, instruction, characterContext } = params

  let prompt = ''

  if (characterContext) {
    prompt += `【相关人物】\n${characterContext}\n\n`
  }

  prompt += `【当前故事内容】\n${previousContent}\n\n`

  if (instruction) {
    prompt += `【作者期望】\n${instruction}\n\n`
  }

  prompt += '请为接下来的剧情发展提供3个不同的方案：'

  return prompt
}

/**
 * System prompt for outline generation
 */
export const OUTLINE_SYSTEM_PROMPT = `你是一位资深的小说策划编辑，擅长构建完整的故事大纲和章节规划。

你的任务是根据小说的基本信息（标题、简介、类型），生成一个完整的章节大纲。

每个章节需要包含：
1. 章节标题（格式：第X章 标题）
2. 章节摘要（50-100字，描述本章主要内容）
3. 冲突程度（1-100，数值越高冲突越激烈）

大纲规划原则：
1. 开篇要引人入胜，快速建立故事背景
2. 节奏要有起伏，不能一直高潮或平淡
3. 每3-5章安排一个小高潮
4. 每卷末尾安排一个大高潮
5. 适当留下悬念和伏笔

请以JSON格式输出，格式如下：
{
  "chapters": [
    {
      "title": "第1章 章节标题",
      "summary": "本章摘要描述",
      "conflictLevel": 60
    }
  ]
}`

/**
 * Build user prompt for outline generation
 */
export function buildOutlinePrompt(params: {
  title: string
  description?: string
  genre?: string
  chapterCount?: number
  existingChapters?: { title: string; summary?: string }[]
}): string {
  const { title, description, genre, chapterCount = 10, existingChapters } = params

  let prompt = `【小说信息】
标题：${title}
${genre ? `类型：${genre}` : ''}
${description ? `简介：${description}` : ''}

`

  if (existingChapters && existingChapters.length > 0) {
    prompt += `【已有章节】
${existingChapters.map((ch, i) => `${i + 1}. ${ch.title}${ch.summary ? ` - ${ch.summary}` : ''}`).join('\n')}

请在此基础上继续规划后续章节。

`
  }

  prompt += `请生成${chapterCount}个章节的大纲：`

  return prompt
}

/**
 * System prompt for extracting settings (characters, locations, items) from outline
 */
export const EXTRACT_SETTINGS_SYSTEM_PROMPT = `你是一位专业的小说世界观构建专家，擅长从故事大纲中提取和设计人物、地点、物品等设定。

你的任务是根据小说的大纲章节信息，分析并提取可能出现的：
1. 人物角色（包括主角和配角）
2. 重要地点（故事发生的场景）
3. 关键物品（有剧情意义的道具）

对于每个设定项，请提供详细但简洁的描述。

请以JSON格式输出，格式如下：
{
  "characters": [
    {
      "name": "人物名称",
      "aliases": ["别名1", "别名2"],
      "description": "一句话描述人物",
      "personality": "性格特点",
      "background": "背景故事",
      "is_protagonist": true
    }
  ],
  "locations": [
    {
      "name": "地点名称",
      "description": "地点描述",
      "environment_keywords": ["关键词1", "关键词2"]
    }
  ],
  "items": [
    {
      "name": "物品名称",
      "category": "weapon/artifact/tool/treasure/other",
      "description": "物品描述及其在故事中的作用"
    }
  ]
}

提取原则：
1. 只提取大纲中明确提到或可以合理推断的设定
2. 主角应标记 is_protagonist 为 true
3. 人物性格要与其在剧情中的表现一致
4. 地点环境关键词用于后续写作时的氛围营造
5. 物品分类要准确（weapon武器/artifact神器/tool工具/treasure宝物/other其他）`

/**
 * Build user prompt for extracting settings from outline
 */
export function buildExtractSettingsPrompt(params: {
  title: string
  description?: string
  genre?: string
  chapters: { title: string; summary?: string }[]
}): string {
  const { title, description, genre, chapters } = params

  let prompt = `【小说信息】
标题：${title}
${genre ? `类型：${genre}` : ''}
${description ? `简介：${description}` : ''}

【章节大纲】
${chapters.map((ch, i) => `${i + 1}. ${ch.title}${ch.summary ? `\n   摘要：${ch.summary}` : ''}`).join('\n')}

请根据以上大纲，提取小说中的人物、地点和重要物品设定：`

  return prompt
}
