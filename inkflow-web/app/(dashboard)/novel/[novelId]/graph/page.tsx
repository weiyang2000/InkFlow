'use client'

import { useParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { RelationshipGraph } from '@/components/wiki'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, Network } from 'lucide-react'
import { useCharacters, useCharacterRelationships } from '@/lib/hooks/useNovels'
import type { Character as LocalCharacter, CharacterRelationship as LocalRelationship } from '@/lib/types'
import type { Character as DbCharacter, CharacterRelationship as DbRelationship } from '@/lib/types/database'

// Convert database character to local character type
function toLocalCharacter(dbChar: DbCharacter): LocalCharacter {
  return {
    id: dbChar.id,
    novelId: dbChar.novel_id,
    name: dbChar.name,
    aliases: dbChar.aliases,
    description: dbChar.description || '',
    personality: dbChar.personality || '',
    background: dbChar.background || '',
    avatarUrl: dbChar.avatar_url || '',
    attributes: dbChar.attributes as Record<string, unknown>,
    isProtagonist: dbChar.is_protagonist,
    createdAt: new Date(dbChar.created_at),
    updatedAt: new Date(dbChar.updated_at),
  }
}

// Convert database relationship to local relationship type
function toLocalRelationship(dbRel: DbRelationship): LocalRelationship {
  return {
    id: dbRel.id,
    novelId: dbRel.novel_id,
    fromCharacterId: dbRel.from_character_id,
    toCharacterId: dbRel.to_character_id,
    relationshipType: dbRel.relationship_type as LocalRelationship['relationshipType'],
    description: dbRel.description || '',
    strength: dbRel.strength,
    createdAt: new Date(dbRel.created_at),
    updatedAt: new Date(dbRel.updated_at),
  }
}

export default function GraphPage() {
  const params = useParams()
  const novelId = params.novelId as string

  const { data: characters = [], isLoading: charactersLoading, error: charactersError } = useCharacters(novelId)
  const { data: relationships = [], isLoading: relationsLoading, error: relationsError } = useCharacterRelationships(novelId)

  const isLoading = charactersLoading || relationsLoading
  const error = charactersError || relationsError

  const handleNodeClick = (character: LocalCharacter) => {
    console.log('Clicked character:', character)
  }

  const handleEdgeClick = (relationship: LocalRelationship) => {
    console.log('Clicked relationship:', relationship)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="关系图谱" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <Header title="关系图谱" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-destructive">加载失败：{error.message}</p>
        </div>
      </div>
    )
  }

  const localCharacters = characters.map(toLocalCharacter)
  const localRelationships = relationships.map(toLocalRelationship)

  return (
    <div className="flex flex-col h-full">
      <Header title="关系图谱" />

      <div className="flex-1 relative">
        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            添加关系
          </Button>
        </div>

        {/* Empty state */}
        {characters.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center h-full">
            <Network className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无人物</h3>
            <p className="text-muted-foreground mb-4">
              请先添加人物后再查看关系图谱
            </p>
          </div>
        ) : (
          /* Graph */
          <RelationshipGraph
            characters={localCharacters}
            relationships={localRelationships}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
          />
        )}
      </div>
    </div>
  )
}
