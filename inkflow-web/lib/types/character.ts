// Character and relationship types

export interface Character {
  id: string
  novelId: string
  name: string
  aliases: string[]
  avatarUrl?: string
  description?: string
  personality?: string
  background?: string
  attributes: Record<string, unknown>
  firstAppearanceChapterId?: string
  isProtagonist: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CharacterState {
  id: string
  characterId: string
  chapterId: string
  stateType: CharacterStateType
  stateKey: string
  stateValue: string
  description?: string
  createdAt: Date
}

export type CharacterStateType =
  | 'appearance'   // 外貌变化
  | 'ability'      // 能力/技能
  | 'status'       // 状态（受伤、死亡等）
  | 'location'     // 位置
  | 'possession'   // 拥有物品

export interface CharacterRelationship {
  id: string
  novelId: string
  fromCharacterId: string
  toCharacterId: string
  relationshipType: RelationshipType
  description?: string
  strength: number // 0-100
  establishedChapterId?: string
  createdAt: Date
  updatedAt: Date
}

export type RelationshipType =
  | 'family'       // 家人
  | 'friend'       // 朋友
  | 'enemy'        // 敌人
  | 'lover'        // 恋人
  | 'master'       // 师父
  | 'disciple'     // 徒弟
  | 'ally'         // 盟友
  | 'rival'        // 对手
  | 'subordinate'  // 下属
  | 'superior'     // 上级
  | 'neutral'      // 中立
  | 'other'        // 其他

export interface CreateCharacterInput {
  novelId: string
  name: string
  aliases?: string[]
  description?: string
  personality?: string
  background?: string
  isProtagonist?: boolean
  attributes?: Record<string, unknown>
}

export interface UpdateCharacterInput {
  name?: string
  aliases?: string[]
  avatarUrl?: string
  description?: string
  personality?: string
  background?: string
  isProtagonist?: boolean
  attributes?: Record<string, unknown>
}

export interface CreateRelationshipInput {
  novelId: string
  fromCharacterId: string
  toCharacterId: string
  relationshipType: RelationshipType
  description?: string
  strength?: number
}

export interface UpdateRelationshipInput {
  relationshipType?: RelationshipType
  description?: string
  strength?: number
}

// Graph visualization types
export interface GraphNode {
  id: string
  type: 'character' | 'location' | 'item'
  label: string
  data: Character | Location | Item
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type: RelationshipType
  label?: string
  strength?: number
}

// Location types
export interface Location {
  id: string
  novelId: string
  name: string
  parentId?: string
  description?: string
  environmentKeywords: string[]
  mapData?: Record<string, unknown>
  createdAt: Date
}

export interface CreateLocationInput {
  novelId: string
  name: string
  parentId?: string
  description?: string
  environmentKeywords?: string[]
}

// Item types
export interface Item {
  id: string
  novelId: string
  name: string
  category: ItemCategory
  description?: string
  attributes: Record<string, unknown>
  ownerId?: string
  firstAppearanceChapterId?: string
  createdAt: Date
}

export type ItemCategory =
  | 'weapon'       // 武器
  | 'artifact'     // 法宝/神器
  | 'skill'        // 技能
  | 'technique'    // 功法
  | 'consumable'   // 消耗品
  | 'material'     // 材料
  | 'other'        // 其他

export interface CreateItemInput {
  novelId: string
  name: string
  category: ItemCategory
  description?: string
  attributes?: Record<string, unknown>
  ownerId?: string
}
