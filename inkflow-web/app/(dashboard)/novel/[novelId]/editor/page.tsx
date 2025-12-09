'use client'

import { useParams } from 'next/navigation'
import { useState, useCallback } from 'react'
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
import { Plus, ChevronRight, FileText, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAiGenerate } from '@/lib/hooks'
import type { SlashCommand } from '@/components/editor/SlashCommand'

// Mock data
const mockChapters = [
  { id: '1', title: '第一章 废物少年', wordCount: 2500, status: 'published' },
  { id: '2', title: '第二章 觉醒', wordCount: 2800, status: 'published' },
  { id: '3', title: '第三章 初试锋芒', wordCount: 3100, status: 'published' },
  { id: '4', title: '第四章 神秘老者', wordCount: 2700, status: 'draft' },
  { id: '5', title: '第五章 修炼突破', wordCount: 2900, status: 'draft' },
]

export default function EditorPage() {
  const params = useParams()
  const novelId = params.novelId as string
  const [selectedChapterId, setSelectedChapterId] = useState(mockChapters[0].id)
  const [isChapterListCollapsed, setIsChapterListCollapsed] = useState(false)

  const selectedChapter = mockChapters.find(c => c.id === selectedChapterId)

  // AI generation hook
  const { generate, isGenerating } = useAiGenerate({
    novelId,
    chapterId: selectedChapterId,
    onComplete: (text, wordCount) => {
      // Content is already inserted via streaming
      console.log(`Generated ${wordCount} characters`)
    },
    onError: (error) => {
      console.error('Generation error:', error)
    },
  })

  // Handle slash command selection
  const handleSlashCommand = useCallback(
    (command: SlashCommand) => {
      // Get instruction based on command
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

      // For retrieval commands, open the sidebar
      if (command.category === 'insert') {
        // TODO: Open sidebar with search
        console.log('Retrieval command:', command.id)
        return
      }

      // Trigger AI generation
      generate(instruction)
    },
    [generate]
  )

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
                  {mockChapters.map((chapter) => (
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
                          {chapter.wordCount} 字
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
                          <DropdownMenuItem>重命名</DropdownMenuItem>
                          <DropdownMenuItem>复制</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Add chapter button */}
              <div className="p-2 border-t">
                <Button variant="outline" size="sm" className="w-full gap-2">
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
                <Select value={selectedChapterId} onValueChange={setSelectedChapterId}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockChapters.map((chapter) => (
                      <SelectItem key={chapter.id} value={chapter.id}>
                        {chapter.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  保存
                </Button>
                <Button size="sm">
                  发布
                </Button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden relative">
              <Editor
                initialContent={`<h1>${selectedChapter?.title || '新章节'}</h1><p>在这里开始写作...</p>`}
                placeholder="开始写作，输入 / 唤起AI助手..."
                onSlashCommand={handleSlashCommand}
              />
              {/* Generating indicator */}
              {isGenerating && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  AI 正在写作中...
                </div>
              )}
            </div>
          </div>

          {/* AI Sidebar */}
          <EditorSidebar />
        </div>
      </div>
    </div>
  )
}
