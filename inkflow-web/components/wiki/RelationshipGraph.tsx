'use client'

import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Character, CharacterRelationship, RelationshipType } from '@/lib/types'

// Custom node component for characters
function CharacterNode({ data }: { data: { character: Character } }) {
  const { character } = data

  return (
    <div className="px-4 py-3 bg-background border-2 rounded-lg shadow-sm min-w-[150px] cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={character.avatarUrl} />
          <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-sm">{character.name}</div>
          {character.isProtagonist && (
            <Badge variant="secondary" className="text-xs">主角</Badge>
          )}
        </div>
      </div>
    </div>
  )
}

const nodeTypes = {
  character: CharacterNode,
}

// Relationship type colors and labels
const relationshipConfig: Record<RelationshipType, { color: string; label: string }> = {
  family: { color: '#22c55e', label: '家人' },
  friend: { color: '#3b82f6', label: '朋友' },
  enemy: { color: '#ef4444', label: '敌人' },
  lover: { color: '#ec4899', label: '恋人' },
  master: { color: '#f59e0b', label: '师父' },
  disciple: { color: '#f59e0b', label: '徒弟' },
  ally: { color: '#06b6d4', label: '盟友' },
  rival: { color: '#8b5cf6', label: '对手' },
  subordinate: { color: '#6b7280', label: '下属' },
  superior: { color: '#6b7280', label: '上级' },
  neutral: { color: '#9ca3af', label: '中立' },
  other: { color: '#9ca3af', label: '其他' },
}

interface RelationshipGraphProps {
  characters: Character[]
  relationships: CharacterRelationship[]
  onNodeClick?: (character: Character) => void
  onEdgeClick?: (relationship: CharacterRelationship) => void
}

export function RelationshipGraph({
  characters,
  relationships,
  onNodeClick,
  onEdgeClick,
}: RelationshipGraphProps) {
  // Generate initial node positions in a circle layout
  const initialNodes: Node[] = useMemo(() => {
    const radius = 200
    const centerX = 300
    const centerY = 200

    return characters.map((character, index) => {
      const angle = (2 * Math.PI * index) / characters.length
      return {
        id: character.id,
        type: 'character',
        position: {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        },
        data: { character },
      }
    })
  }, [characters])

  // Generate edges from relationships
  const initialEdges: Edge[] = useMemo(() => {
    return relationships.map((rel) => {
      const config = relationshipConfig[rel.relationshipType]
      return {
        id: rel.id,
        source: rel.fromCharacterId,
        target: rel.toCharacterId,
        label: config.label,
        labelStyle: { fill: config.color, fontWeight: 500 },
        style: { stroke: config.color, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: config.color,
        },
        data: { relationship: rel },
      }
    })
  }, [relationships])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const character = characters.find((c) => c.id === node.id)
      if (character) {
        onNodeClick?.(character)
      }
    },
    [characters, onNodeClick]
  )

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      const relationship = relationships.find((r) => r.id === edge.id)
      if (relationship) {
        onEdgeClick?.(relationship)
      }
    },
    [relationships, onEdgeClick]
  )

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const character = node.data?.character as Character
            return character?.isProtagonist ? '#f59e0b' : '#6b7280'
          }}
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-background/90 border rounded-lg p-3 space-y-2">
        <div className="text-xs font-medium text-muted-foreground">关系类型</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {Object.entries(relationshipConfig).slice(0, 8).map(([key, { color, label }]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-0.5 rounded"
                style={{ backgroundColor: color }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
