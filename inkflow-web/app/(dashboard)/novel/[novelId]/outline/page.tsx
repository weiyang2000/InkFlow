'use client'

import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
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
  Panel,
  NodeProps,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Plus,
  FileText,
  Sparkles,
  Trash2,
  Edit,
  ChevronRight,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Chapter node data type
interface ChapterNodeData {
  id: string
  title: string
  summary?: string
  wordCount: number
  conflictLevel: number // 0-100 for rhythm heatmap
  status: 'draft' | 'published'
}

// Custom chapter node component
function ChapterNode({ data, selected }: NodeProps<ChapterNodeData>) {
  const getConflictColor = (level: number) => {
    if (level >= 80) return 'border-red-500 bg-red-50 dark:bg-red-950/30'
    if (level >= 60) return 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
    if (level >= 40) return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
    return 'border-green-500 bg-green-50 dark:bg-green-950/30'
  }

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-sm min-w-[200px] transition-all',
        getConflictColor(data.conflictLevel),
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm line-clamp-1">{data.title}</span>
          <Badge variant={data.status === 'published' ? 'default' : 'secondary'} className="text-xs">
            {data.status === 'published' ? '已发' : '草稿'}
          </Badge>
        </div>

        {data.summary && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {data.summary}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{data.wordCount} 字</span>
          <span>冲突度: {data.conflictLevel}%</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
}

const nodeTypes = {
  chapter: ChapterNode,
}

// Mock chapters data
const mockChapters: ChapterNodeData[] = [
  { id: '1', title: '第一章 废物少年', summary: '萧炎三年前是天才，如今斗气尽失', wordCount: 2500, conflictLevel: 30, status: 'published' },
  { id: '2', title: '第二章 觉醒', summary: '在绝望中触发药老觉醒', wordCount: 2800, conflictLevel: 70, status: 'published' },
  { id: '3', title: '第三章 初试锋芒', summary: '击败纨绔子弟，展现实力', wordCount: 3100, conflictLevel: 85, status: 'published' },
  { id: '4', title: '第四章 神秘老者', summary: '药老指点修炼之法', wordCount: 2700, conflictLevel: 20, status: 'draft' },
  { id: '5', title: '第五章 修炼突破', summary: '突破到斗者三段', wordCount: 2900, conflictLevel: 50, status: 'draft' },
  { id: '6', title: '第六章 家族大比', summary: '参加年度家族大比', wordCount: 3200, conflictLevel: 90, status: 'draft' },
]

export default function OutlinePage() {
  const params = useParams()
  const novelId = params.novelId as string

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedChapter, setSelectedChapter] = useState<ChapterNodeData | null>(null)
  const [viewMode, setViewMode] = useState<'flow' | 'list' | 'heatmap'>('flow')

  // Generate initial nodes in a vertical layout
  const initialNodes: Node<ChapterNodeData>[] = useMemo(() => {
    return mockChapters.map((chapter, index) => ({
      id: chapter.id,
      type: 'chapter',
      position: { x: 250, y: index * 150 },
      data: chapter,
    }))
  }, [])

  // Generate edges connecting chapters sequentially
  const initialEdges: Edge[] = useMemo(() => {
    return mockChapters.slice(0, -1).map((chapter, index) => ({
      id: `e${chapter.id}-${mockChapters[index + 1].id}`,
      source: chapter.id,
      target: mockChapters[index + 1].id,
      animated: true,
      style: { stroke: '#6b7280' },
    }))
  }, [])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node<ChapterNodeData>) => {
    setSelectedChapter(node.data)
  }, [])

  const handleAddChapter = () => {
    const newId = String(nodes.length + 1)
    const lastNode = nodes[nodes.length - 1]
    const newNode: Node<ChapterNodeData> = {
      id: newId,
      type: 'chapter',
      position: {
        x: lastNode ? lastNode.position.x : 250,
        y: lastNode ? lastNode.position.y + 150 : 0,
      },
      data: {
        id: newId,
        title: `第${nodes.length + 1}章 新章节`,
        summary: '',
        wordCount: 0,
        conflictLevel: 50,
        status: 'draft',
      },
    }
    setNodes((nds) => [...nds, newNode])

    if (lastNode) {
      setEdges((eds) => [
        ...eds,
        {
          id: `e${lastNode.id}-${newId}`,
          source: lastNode.id,
          target: newId,
          animated: true,
          style: { stroke: '#6b7280' },
        },
      ])
    }
  }

  const handleGenerateOutline = () => {
    // TODO: Call AI to generate outline
    console.log('Generate outline with AI')
  }

  // Rhythm heatmap view
  const HeatmapView = () => (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">节奏热力图</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>平缓</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span>中等</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded" />
            <span>紧张</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span>高潮</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 h-32 items-end">
        {mockChapters.map((chapter) => {
          const getColor = (level: number) => {
            if (level >= 80) return 'bg-red-500'
            if (level >= 60) return 'bg-orange-500'
            if (level >= 40) return 'bg-yellow-500'
            return 'bg-green-500'
          }

          return (
            <div
              key={chapter.id}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  'w-full rounded-t transition-all hover:opacity-80 cursor-pointer',
                  getColor(chapter.conflictLevel)
                )}
                style={{ height: `${chapter.conflictLevel}%` }}
                title={`${chapter.title}: ${chapter.conflictLevel}%`}
              />
              <span className="text-xs text-muted-foreground truncate w-full text-center">
                {chapter.id}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-sm text-muted-foreground">
        提示：保持节奏起伏，避免连续多章高潮或平缓。建议每3-5章安排一个小高潮。
      </p>
    </div>
  )

  // List view
  const ListView = () => (
    <div className="p-6 space-y-4">
      {mockChapters.map((chapter, index) => (
        <Card key={chapter.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{chapter.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={chapter.status === 'published' ? 'default' : 'secondary'}>
                      {chapter.status === 'published' ? '已发布' : '草稿'}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {chapter.summary && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {chapter.summary}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{chapter.wordCount} 字</span>
                  <span>冲突度: {chapter.conflictLevel}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <Header title="大纲编辑" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
              <TabsList>
                <TabsTrigger value="flow">流程图</TabsTrigger>
                <TabsTrigger value="list">列表</TabsTrigger>
                <TabsTrigger value="heatmap">热力图</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleGenerateOutline}>
              <Sparkles className="h-4 w-4 mr-2" />
              AI 生成大纲
            </Button>
            <Button size="sm" onClick={handleAddChapter}>
              <Plus className="h-4 w-4 mr-2" />
              添加章节
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'flow' && (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
            >
              <Background />
              <Controls />
              <MiniMap />

              {/* Side panel for selected chapter */}
              {selectedChapter && (
                <Panel position="top-right" className="m-4">
                  <Card className="w-80">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{selectedChapter.title}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelectedChapter(null)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">摘要</Label>
                        <p className="text-sm mt-1">
                          {selectedChapter.summary || '暂无摘要'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">字数</Label>
                          <p>{selectedChapter.wordCount}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">冲突度</Label>
                          <p>{selectedChapter.conflictLevel}%</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <FileText className="h-4 w-4 mr-2" />
                          编辑正文
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Panel>
              )}
            </ReactFlow>
          )}

          {viewMode === 'list' && (
            <div className="h-full overflow-auto">
              <ListView />
            </div>
          )}

          {viewMode === 'heatmap' && (
            <div className="h-full overflow-auto">
              <HeatmapView />
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑章节</DialogTitle>
            <DialogDescription>修改章节标题和摘要</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>标题</Label>
              <Input placeholder="章节标题" />
            </div>
            <div className="space-y-2">
              <Label>摘要</Label>
              <Textarea placeholder="本章主要内容..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>冲突等级 (0-100)</Label>
              <Input type="number" min={0} max={100} placeholder="50" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
