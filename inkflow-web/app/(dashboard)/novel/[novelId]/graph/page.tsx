'use client'

import { useParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { RelationshipGraph } from '@/components/wiki'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { Character, CharacterRelationship } from '@/lib/types'

// Mock data
const mockCharacters: Character[] = [
  {
    id: '1',
    novelId: '1',
    name: '萧炎',
    aliases: ['炎帝'],
    description: '主角',
    personality: '',
    background: '',
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
    aliases: [],
    description: '导师',
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
    aliases: [],
    description: '',
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
    aliases: [],
    description: '',
    avatarUrl: '',
    attributes: {},
    isProtagonist: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    novelId: '1',
    name: '云韵',
    aliases: [],
    description: '',
    avatarUrl: '',
    attributes: {},
    isProtagonist: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockRelationships: CharacterRelationship[] = [
  {
    id: '1',
    novelId: '1',
    fromCharacterId: '2',
    toCharacterId: '1',
    relationshipType: 'master',
    description: '药老是萧炎的导师',
    strength: 90,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    novelId: '1',
    fromCharacterId: '1',
    toCharacterId: '3',
    relationshipType: 'lover',
    description: '青梅竹马，深爱对方',
    strength: 95,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    novelId: '1',
    fromCharacterId: '4',
    toCharacterId: '1',
    relationshipType: 'rival',
    description: '曾经解除婚约',
    strength: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    novelId: '1',
    fromCharacterId: '5',
    toCharacterId: '1',
    relationshipType: 'friend',
    description: '亦师亦友',
    strength: 80,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function GraphPage() {
  const params = useParams()
  const novelId = params.novelId as string

  const handleNodeClick = (character: Character) => {
    console.log('Clicked character:', character)
  }

  const handleEdgeClick = (relationship: CharacterRelationship) => {
    console.log('Clicked relationship:', relationship)
  }

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

        {/* Graph */}
        <RelationshipGraph
          characters={mockCharacters}
          relationships={mockRelationships}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
        />
      </div>
    </div>
  )
}
