'use client'

import { useParams } from 'next/navigation'
import { useState, useCallback, useEffect, useRef } from 'react'
import { Editor, EditorSidebar } from '@/components/editor'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, ChevronRight, FileText, MoreHorizontal, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useAiGenerate } from '@/lib/hooks'
import { useUIStore } from '@/lib/store'
import { useChapters, useChapter, useCreateChapter, useUpdateChapter, useDeleteChapter } from '@/lib/hooks/useNovels'
import type { SlashCommand } from '@/components/editor/SlashCommand'

export default function EditorPage() {
  const params = useParams()
  const novelId = params.novelId as string

  const { data: chapters = [], isLoading: chaptersLoading } = useChapters(novelId)
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  const [isChapterListCollapsed, setIsChapterListCollapsed] = useState(false)

  // Editor content tracking
  const editorContentRef = useRef<string>('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  // Dialog states
  const [newChapterDialogOpen, setNewChapterDialogOpen] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameChapterId, setRenameChapterId] = useState<string | null>(null)
  const [renameTitle, setRenameTitle] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null)

  // Mutations
  const createChapter = useCreateChapter(novelId)
  const updateChapter = useUpdateChapter(novelId)
  const deleteChapter = useDeleteChapter(novelId)

  // Set default selected chapter
  useEffect(() => {
    if (chapters.length > 0 && !selectedChapterId) {
      setSelectedChapterId(chapters[0].id)
    }
  }, [chapters, selectedChapterId])

  // UI Store for AI panel control
  const { openAiPanelWithTab, setCurrentChapterId } = useUIStore()

  // Sync selected chapter ID to UI store for EditorSidebar to access
  useEffect(() => {
    setCurrentChapterId(selectedChapterId)
  }, [selectedChapterId, setCurrentChapterId])

  // Fetch selected chapter content
  const { data: selectedChapter } = useChapter(
    novelId,
    selectedChapterId || ''
  )

  // AI generation hook
  const { generate, cancel: cancelGeneration, isGenerating } = useAiGenerate({
    novelId,
    chapterId: selectedChapterId || '',
    onComplete: (text, wordCount) => {
      console.log(`Generated ${wordCount} characters`)
    },
    onError: (error) => {
      console.error('Generation error:', error)
    },
  })

  // ESC key to cancel generation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isGenerating) {
        e.preventDefault()
        cancelGeneration()
        console.log('Generation cancelled by ESC key')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isGenerating, cancelGeneration])

  // Auto-cancel generation when switching chapters
  useEffect(() => {
    return () => {
      // Cleanup: cancel any ongoing generation when chapter changes
      cancelGeneration()
    }
  }, [selectedChapterId, cancelGeneration])

  // Handle slash command selection
  const handleSlashCommand = useCallback(
    (command: SlashCommand) => {
      const instructions: Record<string, string> = {
        'continue': '继续写作',
        'continue-plot': '继续推进剧情发展',
        'continue-battle': '续写一段精彩的战斗场面',
        'continue-romance': '续写感情戏，注重人物情感交流',
        'describe-environment': '添加环境描写，营造氛围',
        'add-dialogue': '添加角色对话',
        'rewrite': '润色并改进文本',
        'expand': '扩展当前段落内容',
      }

      const instruction = instructions[command.id] || command.description

      // Handle insert category commands (recall character/location/item)
      if (command.category === 'insert') {
        if (command.id === 'recall-character') {
          openAiPanelWithTab('characters')
        } else if (command.id === 'recall-location' || command.id === 'recall-item') {
          // TODO: Add location and item tabs in the future
          console.log('Retrieval command:', command.id)
        }
        return
      }

      generate(instruction)
    },
    [generate, openAiPanelWithTab]
  )

  // Handle create chapter
  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) return

    try {
      const chapter = await createChapter.mutateAsync({
        title: newChapterTitle.trim(),
        content: '',
        status: 'draft',
      })
      setSelectedChapterId(chapter.id)
      setNewChapterDialogOpen(false)
      setNewChapterTitle('')
    } catch (error) {
      console.error('Failed to create chapter:', error)
    }
  }

  // Handle rename chapter
  const handleRenameChapter = async () => {
    if (!renameChapterId || !renameTitle.trim()) return

    try {
      await updateChapter.mutateAsync({
        chapterId: renameChapterId,
        data: { title: renameTitle.trim() },
      })
      setRenameDialogOpen(false)
      setRenameChapterId(null)
      setRenameTitle('')
    } catch (error) {
      console.error('Failed to rename chapter:', error)
    }
  }

  // Handle delete chapter
  const handleDeleteChapter = async () => {
    if (!deleteChapterId) return

    try {
      await deleteChapter.mutateAsync(deleteChapterId)
      if (selectedChapterId === deleteChapterId) {
        setSelectedChapterId(chapters.find(c => c.id !== deleteChapterId)?.id || null)
      }
      setDeleteDialogOpen(false)
      setDeleteChapterId(null)
    } catch (error) {
      console.error('Failed to delete chapter:', error)
    }
  }

  // Open rename dialog
  const openRenameDialog = (chapterId: string, currentTitle: string) => {
    setRenameChapterId(chapterId)
    setRenameTitle(currentTitle)
    setRenameDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (chapterId: string) => {
    setDeleteChapterId(chapterId)
    setDeleteDialogOpen(true)
  }

  // Handle editor content update
  const handleEditorUpdate = useCallback((content: string) => {
    editorContentRef.current = content
    setHasUnsavedChanges(true)
  }, [])

  // Calculate word count from HTML content
  const calculateWordCount = (html: string): number => {
    // Remove HTML tags
    const text = html.replace(/<[^>]*>/g, '')
    // Count Chinese characters
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    // Count English words
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length
    return chineseChars + englishWords
  }

  // Handle save chapter
  const handleSave = async () => {
    if (!selectedChapterId || isSaving) return

    setIsSaving(true)
    try {
      const content = editorContentRef.current
      const wordCount = calculateWordCount(content)

      await updateChapter.mutateAsync({
        chapterId: selectedChapterId,
        data: {
          content,
          word_count: wordCount,
        },
      })
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save chapter:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle publish chapter
  const handlePublish = async () => {
    if (!selectedChapterId || isPublishing) return

    setIsPublishing(true)
    try {
      // First save the content
      const content = editorContentRef.current
      const wordCount = calculateWordCount(content)

      await updateChapter.mutateAsync({
        chapterId: selectedChapterId,
        data: {
          content,
          word_count: wordCount,
          status: 'published',
        },
      })
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to publish chapter:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  // Reset unsaved changes when switching chapters
  useEffect(() => {
    setHasUnsavedChanges(false)
    editorContentRef.current = selectedChapter?.content || ''
  }, [selectedChapterId, selectedChapter?.content])

  if (chaptersLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="编辑器" showSearch />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="编辑器" showSearch />

      <div className="flex-1 flex overflow-hidden">
        {/* Chapter list sidebar */}
        <div
          className={cn(
            'border-r bg-muted/30 flex flex-col transition-all duration-300',
            isChapterListCollapsed ? 'w-12' : 'w-64'
          )}
        >
          {/* Chapter list header */}
          <div className="flex items-center justify-between p-3 border-b">
            {!isChapterListCollapsed && (
              <span className="text-sm font-medium">章节列表</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsChapterListCollapsed(!isChapterListCollapsed)}
            >
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  isChapterListCollapsed ? '' : 'rotate-180'
                )}
              />
            </Button>
          </div>

          {/* Chapter list */}
          {!isChapterListCollapsed && (
            <>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {chapters.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      暂无章节
                    </div>
                  ) : (
                    chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedChapterId(chapter.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedChapterId(chapter.id)
                          }
                        }}
                        className={cn(
                          'group w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-colors cursor-pointer',
                          selectedChapterId === chapter.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        )}
                      >
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{chapter.title}</div>
                          <div
                            className={cn(
                              'text-xs',
                              selectedChapterId === chapter.id
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            )}
                          >
                            {chapter.word_count} 字
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                openRenameDialog(chapter.id, chapter.title)
                              }}
                            >
                              重命名
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                openDeleteDialog(chapter.id)
                              }}
                            >
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Add chapter button */}
              <div className="p-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => setNewChapterDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  新建章节
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Main editor area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chapter title bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
              <div className="flex items-center gap-4">
                {chapters.length > 0 && selectedChapterId ? (
                  <Select value={selectedChapterId} onValueChange={setSelectedChapterId}>
                    <SelectTrigger className="w-[280px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {chapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          {chapter.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    请创建或选择一个章节
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!selectedChapterId || isSaving}
                  onClick={handleSave}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : hasUnsavedChanges ? (
                    '保存 *'
                  ) : (
                    '保存'
                  )}
                </Button>
                <Button
                  size="sm"
                  disabled={!selectedChapterId || isPublishing}
                  onClick={handlePublish}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      发布中...
                    </>
                  ) : (
                    '发布'
                  )}
                </Button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden relative">
              {selectedChapter ? (
                <Editor
                  key={selectedChapter.id}
                  initialContent={selectedChapter.content || `<h1>${selectedChapter.title}</h1><p>在这里开始写作...</p>`}
                  placeholder="开始写作，输入 / 唤起AI助手..."
                  onSlashCommand={handleSlashCommand}
                  onUpdate={handleEditorUpdate}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {chapters.length === 0 ? '请先创建一个章节' : '请选择一个章节'}
                </div>
              )}
              {/* Generating indicator */}
              {isGenerating && (
                <div
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2 cursor-pointer hover:bg-primary/90"
                  onClick={cancelGeneration}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      cancelGeneration()
                    }
                  }}
                  title="点击或按 ESC 停止生成"
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  AI 正在写作中... (按 ESC 停止)
                </div>
              )}
            </div>
          </div>

          {/* AI Sidebar */}
          <EditorSidebar />
        </div>
      </div>

      {/* New Chapter Dialog */}
      <Dialog open={newChapterDialogOpen} onOpenChange={setNewChapterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建章节</DialogTitle>
            <DialogDescription>请输入章节标题</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="chapter-title">章节标题</Label>
              <Input
                id="chapter-title"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder="第X章 标题"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateChapter()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewChapterDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateChapter} disabled={createChapter.isPending}>
              {createChapter.isPending ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名章节</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-title">章节标题</Label>
              <Input
                id="rename-title"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameChapter()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleRenameChapter} disabled={updateChapter.isPending}>
              {updateChapter.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除章节？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该章节及其内容，且无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChapter}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteChapter.isPending ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
