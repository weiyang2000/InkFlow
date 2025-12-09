'use client'

import { useParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { CharacterList } from '@/components/wiki'
import type { Character } from '@/lib/types'

// Mock data
const mockCharacters: Character[] = [
  {
    id: '1',
    novelId: '1',
    name: '萧炎',
    aliases: ['炎帝', '斗帝萧炎'],
    description: '曾经的天才少年，三年间斗气尽失，后觉醒异火之力',
    personality: '坚韧不拔，重情重义，遇强则强',
    background: '萧家少主，与纳兰嫣然有婚约...',
    avatarUrl: '',
    attributes: {},
    isProtagonist: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    novelId: '1',
    name: '药老',
    aliases: ['药尘', '药圣'],
    description: '隐居萧炎戒指中的神秘强者',
    personality: '睿智、幽默，偶尔毒舌',
    background: '曾经的炼药界巅峰存在...',
    avatarUrl: '',
    attributes: {},
    isProtagonist: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    novelId: '1',
    name: '萧薰儿',
    aliases: ['薰儿'],
    description: '古族血脉觉醒者，萧炎青梅竹马',
    personality: '温柔善良，对萧炎情深义重',
    background: '古族后裔，身份神秘...',
    avatarUrl: '',
    attributes: {},
    isProtagonist: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    novelId: '1',
    name: '纳兰嫣然',
    aliases: ['嫣然'],
    description: '云岚宗天才弟子，曾与萧炎有婚约',
    personality: '高傲，后期转变',
    background: '纳兰家族千金，云岚宗弟子...',
    avatarUrl: '',
    attributes: {},
    isProtagonist: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function CharactersPage() {
  const params = useParams()
  const novelId = params.novelId as string

  const handleSelectCharacter = (character: Character) => {
    console.log('Selected character:', character)
    // TODO: Open detail view or navigate
  }

  const handleEditCharacter = (character: Character) => {
    console.log('Edit character:', character)
    // TODO: Open edit dialog
  }

  const handleDeleteCharacter = (character: Character) => {
    console.log('Delete character:', character)
    // TODO: Confirm and delete
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="人物管理" />
      <div className="flex-1 p-6 overflow-auto">
        <CharacterList
          characters={mockCharacters}
          onSelect={handleSelectCharacter}
          onEdit={handleEditCharacter}
          onDelete={handleDeleteCharacter}
        />
      </div>
    </div>
  )
}
