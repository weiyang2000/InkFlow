'use client'

import { useParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { CharacterList } from '@/components/wiki'
import { useCharacters } from '@/lib/hooks/useNovels'
import { Loader2 } from 'lucide-react'
import type { Character as LocalCharacter } from '@/lib/types'
import type { Character as DbCharacter } from '@/lib/types/database'

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

export default function CharactersPage() {
  const params = useParams()
  const novelId = params.novelId as string

  const { data: characters = [], isLoading, error } = useCharacters(novelId)

  const handleSelectCharacter = (character: LocalCharacter) => {
    console.log('Selected character:', character)
    // TODO: Open detail view or navigate
  }

  const handleEditCharacter = (character: LocalCharacter) => {
    console.log('Edit character:', character)
    // TODO: Open edit dialog
  }

  const handleDeleteCharacter = (character: LocalCharacter) => {
    console.log('Delete character:', character)
    // TODO: Confirm and delete
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="人物管理" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <Header title="人物管理" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-destructive">加载失败：{error.message}</p>
        </div>
      </div>
    )
  }

  const localCharacters = characters.map(toLocalCharacter)

  return (
    <div className="flex flex-col h-full">
      <Header title="人物管理" />
      <div className="flex-1 p-6 overflow-auto">
        <CharacterList
          characters={localCharacters}
          onSelect={handleSelectCharacter}
          onEdit={handleEditCharacter}
          onDelete={handleDeleteCharacter}
        />
      </div>
    </div>
  )
}
