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
}): string {
  const { previousContent, instruction, characterContext, worldContext } = params

  let prompt = ''

  // Add context information if available
  if (characterContext) {
    prompt += `【相关人物设定】\n${characterContext}\n\n`
  }

  if (worldContext) {
    prompt += `【相关世界观设定】\n${worldContext}\n\n`
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
