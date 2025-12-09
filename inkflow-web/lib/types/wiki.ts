// Wiki entry types

export interface WikiEntry {
  id: string
  novelId: string
  category: WikiCategory
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type WikiCategory =
  | 'system'       // 体系/等级系统
  | 'rule'         // 世界规则
  | 'faction'      // 势力/门派
  | 'event'        // 重大事件
  | 'culture'      // 文化/风俗
  | 'other'        // 其他

export interface CreateWikiEntryInput {
  novelId: string
  category: WikiCategory
  title: string
  content: string
  tags?: string[]
}

export interface UpdateWikiEntryInput {
  category?: WikiCategory
  title?: string
  content?: string
  tags?: string[]
}

// Change log for auto-archiving
export interface ChangeLog {
  id: string
  novelId: string
  chapterId?: string
  changeType: ChangeType
  entityType: EntityType
  entityId?: string
  oldValue?: Record<string, unknown>
  newValue: Record<string, unknown>
  description: string
  isConfirmed: boolean
  createdAt: Date
}

export type ChangeType =
  | 'character_created'
  | 'character_updated'
  | 'character_state_changed'
  | 'item_acquired'
  | 'item_lost'
  | 'relationship_changed'
  | 'location_discovered'
  | 'event_occurred'

export type EntityType =
  | 'character'
  | 'item'
  | 'location'
  | 'relationship'
  | 'wiki_entry'
