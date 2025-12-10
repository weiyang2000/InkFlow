'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Edit,
  ChevronRight,
  Loader2,
  BarChart3,
  Users,
  MapPin,
  Package,
  Check,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChapters, useCreateChapter, useUpdateChapter, useNovel, useExtractSettings, useBatchCreateSettings, type ExtractedSettings, type BatchSettingsResult } from '@/lib/hooks/useNovels'
import type { Chapter } from '@/lib/types/database'
import { useQueryClient } from '@tanstack/react-query'

// Chapter node data type
interface ChapterNodeData {
  id: string
  title: string
  summary?: string
  wordCount: number
  conflictLevel: number // 0-100 for rhythm heatmap
  status: 'draft' | 'published'
}

// Convert database chapter to node data
function toChapterNodeData(chapter: Chapter): ChapterNodeData {
  const outlineData = chapter.outline_data as { conflictLevel?: number } | null
  return {
    id: chapter.id,
    title: chapter.title,
    summary: chapter.summary || undefined,
    wordCount: chapter.word_count,
    conflictLevel: outlineData?.conflictLevel ?? 50,
    status: chapter.status === 'published' ? 'published' : 'draft',
  }
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

export default function OutlinePage() {
  const params = useParams()
  const novelId = params.novelId as string
  const queryClient = useQueryClient()

  const { data: novel } = useNovel(novelId)
  const { data: chapters = [], isLoading, error } = useChapters(novelId)
  const createChapter = useCreateChapter(novelId)
  const updateChapter = useUpdateChapter(novelId)
  const extractSettings = useExtractSettings()
  const batchCreateSettings = useBatchCreateSettings(novelId)

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [chapterCount, setChapterCount] = useState(10)
  const [selectedChapter, setSelectedChapter] = useState<ChapterNodeData | null>(null)
  const [viewMode, setViewMode] = useState<'flow' | 'list' | 'heatmap'>('flow')

  // Settings extraction state
  const [extractedSettings, setExtractedSettings] = useState<ExtractedSettings | null>(null)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [saveResult, setSaveResult] = useState<BatchSettingsResult | null>(null)

  // Edit form state
  const [editChapterId, setEditChapterId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSummary, setEditSummary] = useState('')
  const [editConflictLevel, setEditConflictLevel] = useState(50)

  // Convert chapters to node data
  const chapterNodes = useMemo(() => chapters.map(toChapterNodeData), [chapters])

  // Generate initial nodes in a vertical layout
  const initialNodes: Node<ChapterNodeData>[] = useMemo(() => {
    return chapterNodes.map((chapter, index) => ({
      id: chapter.id,
      type: 'chapter',
      position: { x: 250, y: index * 150 },
      data: chapter,
    }))
  }, [chapterNodes])

  // Generate edges connecting chapters sequentially
  const initialEdges: Edge[] = useMemo(() => {
    return chapterNodes.slice(0, -1).map((chapter, index) => ({
      id: `e${chapter.id}-${chapterNodes[index + 1].id}`,
      source: chapter.id,
      target: chapterNodes[index + 1].id,
      animated: true,
      style: { stroke: '#6b7280' },
    }))
  }, [chapterNodes])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes when chapters change - use functional updates to avoid infinite loops
  useEffect(() => {
    // Use functional update to access current nodes without adding to dependencies
    setNodes((currentNodes) => {
      const newChapterNodes = chapters.map(toChapterNodeData)
      return newChapterNodes.map((chapter, index) => ({
        id: chapter.id,
        type: 'chapter',
        // Preserve existing position if node exists, otherwise use default layout
        position: currentNodes.find(n => n.id === chapter.id)?.position || { x: 250, y: index * 150 },
        data: chapter,
      }))
    })

    setEdges(() => {
      const newChapterNodes = chapters.map(toChapterNodeData)
      return newChapterNodes.slice(0, -1).map((chapter, index) => ({
        id: `e${chapter.id}-${newChapterNodes[index + 1].id}`,
        source: chapter.id,
        target: newChapterNodes[index + 1].id,
        animated: true,
        style: { stroke: '#6b7280' },
      }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node<ChapterNodeData>) => {
    setSelectedChapter(node.data)
  }, [])

  const handleAddChapter = async () => {
    const newTitle = `第${chapters.length + 1}章 新章节`
    try {
      await createChapter.mutateAsync({
        title: newTitle,
        content: '',
        status: 'draft',
      })
    } catch (error) {
      console.error('Failed to create chapter:', error)
    }
  }

  const handleOpenGenerateDialog = () => {
    setGenerateError(null)
    setIsGenerateDialogOpen(true)
  }

  const handleGenerateOutline = async () => {
    if (!novel) return

    setIsGenerating(true)
    setGenerateError(null)

    try {
      // Call AI outline generation API
      const response = await fetch('/api/ai/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: novel.title,
          description: novel.description,
          genre: novel.genre,
          chapterCount,
          existingChapters: chapters.map(ch => ({
            title: ch.title,
            summary: ch.summary,
          })),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '生成失败')
      }

      const data = await response.json()
      const generatedChapters = data.chapters as Array<{
        title: string
        summary: string
        conflictLevel: number
      }>

      // Batch create chapters
      for (const chapter of generatedChapters) {
        await createChapter.mutateAsync({
          title: chapter.title,
          content: '',
          summary: chapter.summary,
          status: 'draft',
          outline_data: { conflictLevel: chapter.conflictLevel },
        })
      }

      // Refresh chapters list
      queryClient.invalidateQueries({ queryKey: ['chapters', novelId] })

      setIsGenerateDialogOpen(false)
    } catch (error) {
      console.error('Failed to generate outline:', error)
      setGenerateError(error instanceof Error ? error.message : '生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // Open edit dialog with chapter data
  const handleOpenEditDialog = (chapter: ChapterNodeData) => {
    setEditChapterId(chapter.id)
    setEditTitle(chapter.title)
    setEditSummary(chapter.summary || '')
    setEditConflictLevel(chapter.conflictLevel)
    setIsEditDialogOpen(true)
  }

  // Save chapter edits
  const handleSaveChapter = async () => {
    if (!editChapterId) return

    try {
      await updateChapter.mutateAsync({
        chapterId: editChapterId,
        data: {
          title: editTitle.trim(),
          summary: editSummary.trim() || null,
          outline_data: { conflictLevel: editConflictLevel },
        },
      })
      setIsEditDialogOpen(false)
      setEditChapterId(null)
      // Also update selected chapter if it's the same
      if (selectedChapter?.id === editChapterId) {
        setSelectedChapter({
          ...selectedChapter,
          title: editTitle.trim(),
          summary: editSummary.trim() || undefined,
          conflictLevel: editConflictLevel,
        })
      }
    } catch (error) {
      console.error('Failed to update chapter:', error)
    }
  }

  // Open settings extraction dialog
  const handleOpenSettingsDialog = () => {
    setExtractedSettings(null)
    setSettingsError(null)
    setSaveResult(null)
    setIsSettingsDialogOpen(true)
  }

  // Extract settings from outline using AI
  const handleExtractSettings = async () => {
    if (!novel || chapters.length === 0) return

    setSettingsError(null)
    setSaveResult(null)

    try {
      const result = await extractSettings.mutateAsync({
        title: novel.title,
        description: novel.description || undefined,
        genre: novel.genre || undefined,
        chapters: chapters.map((ch) => ({
          title: ch.title,
          summary: ch.summary || undefined,
        })),
      })
      setExtractedSettings(result)
    } catch (error) {
      console.error('Failed to extract settings:', error)
      setSettingsError(error instanceof Error ? error.message : '提取设定失败，请重试')
    }
  }

  // Save extracted settings to database
  const handleSaveSettings = async () => {
    if (!extractedSettings) return

    try {
      const result = await batchCreateSettings.mutateAsync(extractedSettings)
      setSaveResult(result)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSettingsError(error instanceof Error ? error.message : '保存设定失败，请重试')
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="大纲编辑" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <Header title="大纲编辑" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-destructive">加载失败：{error.message}</p>
        </div>
      </div>
    )
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

      {chapterNodes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          暂无章节数据
        </div>
      ) : (
        <div className="flex gap-1 h-32 items-end">
          {chapterNodes.map((chapter, index) => {
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
                  {index + 1}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        提示：保持节奏起伏，避免连续多章高潮或平缓。建议每3-5章安排一个小高潮。
      </p>
    </div>
  )

  // List view
  const ListView = () => (
    <div className="p-6 space-y-4">
      {chapterNodes.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">暂无章节</h3>
          <p className="text-muted-foreground mb-4">
            点击上方按钮添加你的第一个章节
          </p>
        </div>
      ) : (
        chapterNodes.map((chapter, index) => (
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(chapter)}>
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
        ))
      )}
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
            <Button variant="outline" size="sm" onClick={handleOpenGenerateDialog}>
              <Sparkles className="h-4 w-4 mr-2" />
              AI 生成大纲
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenSettingsDialog}
              disabled={chapters.length === 0}
            >
              <Users className="h-4 w-4 mr-2" />
              生成设定卡片
            </Button>
            <Button size="sm" onClick={handleAddChapter} disabled={createChapter.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              {createChapter.isPending ? '添加中...' : '添加章节'}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'flow' && (
            chapterNodes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center h-full">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无章节</h3>
                <p className="text-muted-foreground mb-4">
                  点击上方按钮添加你的第一个章节
                </p>
              </div>
            ) : (
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
                          <Button size="sm" variant="outline" onClick={() => handleOpenEditDialog(selectedChapter)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Panel>
                )}
              </ReactFlow>
            )
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

      {/* Generate Outline Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI 生成大纲</DialogTitle>
            <DialogDescription>
              AI 将根据小说信息自动生成章节大纲
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>小说标题</Label>
              <Input value={novel?.title || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>生成章节数量</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={chapterCount}
                onChange={(e) => setChapterCount(Math.min(30, Math.max(1, parseInt(e.target.value) || 10)))}
              />
              <p className="text-xs text-muted-foreground">
                建议一次生成 5-15 章，最多 30 章
              </p>
            </div>
            {chapters.length > 0 && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <p>当前已有 {chapters.length} 个章节，AI 将在此基础上继续规划新章节。</p>
              </div>
            )}
            {generateError && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {generateError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)} disabled={isGenerating}>
              取消
            </Button>
            <Button onClick={handleGenerateOutline} disabled={isGenerating || !novel}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  开始生成
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Input
                placeholder="章节标题"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>摘要</Label>
              <Textarea
                placeholder="本章主要内容..."
                rows={3}
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>冲突等级 (0-100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={editConflictLevel}
                onChange={(e) => setEditConflictLevel(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveChapter} disabled={updateChapter.isPending}>
              {updateChapter.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Extraction Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>生成设定卡片</DialogTitle>
            <DialogDescription>
              AI 将根据大纲内容自动提取人物、地点、物品等设定
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {/* Initial state - before extraction */}
            {!extractedSettings && !extractSettings.isPending && !settingsError && !saveResult && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  点击下方按钮，AI 将从 {chapters.length} 个章节中提取设定信息
                </p>
                <Button onClick={handleExtractSettings}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  开始提取设定
                </Button>
              </div>
            )}

            {/* Loading state */}
            {extractSettings.isPending && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">AI 正在分析大纲，提取设定中...</p>
              </div>
            )}

            {/* Error state */}
            {settingsError && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
                <p className="text-destructive mb-4">{settingsError}</p>
                <Button onClick={handleExtractSettings} variant="outline">
                  重新提取
                </Button>
              </div>
            )}

            {/* Save result state */}
            {saveResult && (
              <div className="text-center py-8">
                <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">设定已保存</h3>
                <div className="text-sm text-muted-foreground space-y-1 mb-4">
                  <p>创建了 {saveResult.charactersCreated} 个人物</p>
                  <p>创建了 {saveResult.locationsCreated} 个地点</p>
                  <p>创建了 {saveResult.itemsCreated} 个物品</p>
                </div>
                {saveResult.warnings.length > 0 && (
                  <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                    {saveResult.warnings.map((w, i) => (
                      <p key={i}>{w}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Extracted settings preview */}
            {extractedSettings && !saveResult && (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {/* Characters */}
                  {extractedSettings.characters.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-purple-500" />
                        <h4 className="font-medium">人物 ({extractedSettings.characters.length})</h4>
                      </div>
                      <div className="space-y-2">
                        {extractedSettings.characters.map((char, index) => (
                          <Card key={index}>
                            <CardContent className="pt-3 pb-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{char.name}</span>
                                    {char.is_protagonist && (
                                      <Badge variant="secondary" className="text-xs">主角</Badge>
                                    )}
                                  </div>
                                  {char.aliases && char.aliases.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      别名：{char.aliases.join('、')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {char.description && (
                                <p className="text-sm text-muted-foreground mt-2">{char.description}</p>
                              )}
                              {char.personality && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  <span className="font-medium">性格：</span>{char.personality}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Locations */}
                  {extractedSettings.locations.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <h4 className="font-medium">地点 ({extractedSettings.locations.length})</h4>
                      </div>
                      <div className="space-y-2">
                        {extractedSettings.locations.map((loc, index) => (
                          <Card key={index}>
                            <CardContent className="pt-3 pb-3">
                              <div className="font-medium">{loc.name}</div>
                              {loc.description && (
                                <p className="text-sm text-muted-foreground mt-1">{loc.description}</p>
                              )}
                              {loc.environment_keywords && loc.environment_keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {loc.environment_keywords.map((kw, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  {extractedSettings.items.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="h-4 w-4 text-amber-500" />
                        <h4 className="font-medium">物品 ({extractedSettings.items.length})</h4>
                      </div>
                      <div className="space-y-2">
                        {extractedSettings.items.map((item, index) => (
                          <Card key={index}>
                            <CardContent className="pt-3 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.name}</span>
                                <Badge variant="outline" className="text-xs">{item.category}</Badge>
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
              {saveResult ? '完成' : '取消'}
            </Button>
            {extractedSettings && !saveResult && (
              <Button onClick={handleSaveSettings} disabled={batchCreateSettings.isPending}>
                {batchCreateSettings.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    保存设定
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
