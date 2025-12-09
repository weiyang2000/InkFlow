// Novel related types

export interface Novel {
  id: string
  userId: string
  title: string
  description?: string
  genre?: NovelGenre
  coverUrl?: string
  wordCount: number
  status: NovelStatus
  settings: NovelSettings
  createdAt: Date
  updatedAt: Date
}

export type NovelStatus = 'draft' | 'publishing' | 'completed'

export type NovelGenre =
  | 'fantasy'      // 玄幻
  | 'wuxia'        // 武侠
  | 'romance'      // 言情
  | 'scifi'        // 科幻
  | 'urban'        // 都市
  | 'history'      // 历史
  | 'mystery'      // 悬疑
  | 'gaming'       // 游戏
  | 'other'        // 其他

export interface NovelSettings {
  aiModel?: string
  writingStyle?: WritingStyle
  enableAutoArchive?: boolean
  enableGraphRag?: boolean
}

export type WritingStyle = 'plot' | 'atmosphere' | 'comedy'

export interface Volume {
  id: string
  novelId: string
  title: string
  description?: string
  sortOrder: number
  createdAt: Date
}

export interface Chapter {
  id: string
  novelId: string
  volumeId?: string
  title: string
  content: string
  summary?: string
  wordCount: number
  sortOrder: number
  status: ChapterStatus
  outlineData?: OutlineNodeData
  createdAt: Date
  updatedAt: Date
}

export type ChapterStatus = 'draft' | 'published'

export interface OutlineNodeData {
  x?: number
  y?: number
  conflictLevel?: number // 0-100 for rhythm heatmap
  notes?: string
}

export interface CreateNovelInput {
  title: string
  description?: string
  genre?: NovelGenre
}

export interface UpdateNovelInput {
  title?: string
  description?: string
  genre?: NovelGenre
  coverUrl?: string
  status?: NovelStatus
  settings?: Partial<NovelSettings>
}

export interface CreateChapterInput {
  novelId: string
  volumeId?: string
  title: string
  content?: string
  sortOrder?: number
}

export interface UpdateChapterInput {
  title?: string
  content?: string
  summary?: string
  volumeId?: string
  sortOrder?: number
  status?: ChapterStatus
  outlineData?: OutlineNodeData
}
