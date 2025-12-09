// AI interaction types

export interface GenerateRequest {
  novelId: string
  chapterId: string
  mode: WritingMode
  instruction?: string
  contextLength?: number
  planId?: string
}

export type WritingMode =
  | 'plot'         // 剧情推进模式
  | 'atmosphere'   // 氛围渲染模式
  | 'comedy'       // 沙雕/轻松模式
  | 'battle'       // 战斗场景模式
  | 'romance'      // 感情戏模式
  | 'dialogue'     // 对话模式
  | 'rewrite'      // 润色重写模式
  | 'expand'       // 扩写模式

export interface GenerateStreamEvent {
  type: 'token' | 'done' | 'error'
  content?: string
  wordCount?: number
  tokensUsed?: number
  error?: string
}

export interface PlanRequest {
  novelId: string
  chapterId: string
  instruction?: string
}

export interface PlanOption {
  id: string
  title: string
  description: string
  conflictLevel?: number
}

export interface PlanResponse {
  plans: PlanOption[]
}

export interface RewriteRequest {
  novelId: string
  chapterId: string
  selectedText: string
  style: RewriteStyle
}

export type RewriteStyle =
  | 'vivid'        // 更有画面感
  | 'concise'      // 更简练
  | 'first_person' // 转换为第一人称
  | 'third_person' // 转换为第三人称
  | 'emotional'    // 增加情感描写

export interface ChatRequest {
  novelId: string
  chapterId?: string
  messages: ChatMessage[]
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface SearchRequest {
  novelId: string
  query: string
  limit?: number
}

export interface SearchResult {
  type: 'wiki' | 'chapter' | 'character' | 'item' | 'location'
  id: string
  title: string
  content: string
  score: number
  metadata?: Record<string, unknown>
}

export interface SearchResponse {
  results: SearchResult[]
}

// Consistency check
export interface ConsistencyWarning {
  id: string
  type: ConsistencyWarningType
  severity: 'info' | 'warning' | 'error'
  message: string
  suggestion?: string
  relatedEntities?: string[]
}

export type ConsistencyWarningType =
  | 'character_contradiction'  // 人物设定矛盾
  | 'timeline_conflict'        // 时间线冲突
  | 'ability_mismatch'         // 能力不匹配
  | 'location_error'           // 地点错误
  | 'item_inconsistency'       // 物品不一致
