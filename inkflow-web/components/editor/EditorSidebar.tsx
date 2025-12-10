'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sparkles,
  Send,
  X,
  Loader2,
  Wand2,
  BookOpen,
  Target,
  Lightbulb,
  Users,
  Star,
  Search,
  Copy,
  Check,
} from 'lucide-react'
import { useEditorStore, useUIStore } from '@/lib/store'
import { useAiGenerate, useAiChat } from '@/lib/hooks'
import { useCharacters } from '@/lib/hooks/useNovels'
import { cn } from '@/lib/utils'
import type { WritingMode } from '@/lib/types'
import type { Character } from '@/lib/types/database'

export function EditorSidebar() {
  const params = useParams()
  const novelId = params.novelId as string
  const scrollRef = useRef<HTMLDivElement>(null)

  const { isAiPanelOpen, setAiPanelOpen, aiPanelWidth, aiPanelTab, setAiPanelTab, currentChapterId } = useUIStore()
  const {
    currentMode,
    setCurrentMode,
    planOptions,
    selectedPlanId,
    setSelectedPlanId,
    copilotMessages,
    content,
  } = useEditorStore()

  const [generateInput, setGenerateInput] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [characterSearch, setCharacterSearch] = useState('')
  const [expandedCharacterId, setExpandedCharacterId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Fetch characters for the novel
  const { data: characters = [], isLoading: charactersLoading } = useCharacters(novelId)

  // AI Generate hook
  const { generate, cancel: cancelGeneration, isGenerating } = useAiGenerate({
    novelId,
    chapterId: currentChapterId || '',
    onComplete: (text, wordCount) => {
      console.log(`Generated ${wordCount} characters`)
      setGenerateInput('')
    },
    onError: (error) => {
      console.error('Generation error:', error)
    },
  })

  // AI Chat hook
  const { sendMessage, cancel: cancelChat, isLoading: isChatLoading } = useAiChat()

  // ESC key to cancel generation/chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isGenerating) {
          e.preventDefault()
          cancelGeneration()
          console.log('AI generation cancelled by ESC key')
        }
        if (isChatLoading) {
          e.preventDefault()
          cancelChat()
          console.log('AI chat cancelled by ESC key')
        }
      }
    }

    if (isAiPanelOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAiPanelOpen, isGenerating, isChatLoading, cancelGeneration, cancelChat])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [copilotMessages])

  const writingModes: { value: WritingMode; label: string; icon: React.ElementType; description: string }[] = [
    { value: 'plot', label: '剧情推进', icon: Target, description: '注重动作、对话，推进情节' },
    { value: 'atmosphere', label: '氛围渲染', icon: BookOpen, description: '注重景物、心理描写' },
    { value: 'comedy', label: '轻松幽默', icon: Lightbulb, description: '适合轻小说，增加玩梗' },
  ]

  const quickActions = [
    { label: '描写环境', mode: 'atmosphere' as WritingMode, instruction: '添加环境描写' },
    { label: '添加对话', mode: 'dialogue' as WritingMode, instruction: '添加角色对话' },
    { label: '战斗场面', mode: 'battle' as WritingMode, instruction: '续写战斗场面' },
    { label: '心理描写', mode: 'atmosphere' as WritingMode, instruction: '添加心理描写' },
    { label: '转场过渡', mode: 'plot' as WritingMode, instruction: '添加转场过渡' },
  ]

  const handleGenerate = () => {
    if (isGenerating) return
    generate(generateInput || '继续写作', currentMode, selectedPlanId || undefined)
  }

  const handleSendChat = () => {
    if (!chatInput.trim() || isChatLoading) return
    // Pass current content as context
    sendMessage(chatInput, content.slice(0, 2000))
    setChatInput('')
  }

  const handleQuickAction = (action: typeof quickActions[0]) => {
    setCurrentMode(action.mode)
    generate(action.instruction, action.mode)
  }

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId)
  }

  // Filter characters based on search
  const filteredCharacters = characters.filter(
    (c) =>
      c.name.toLowerCase().includes(characterSearch.toLowerCase()) ||
      c.aliases.some((a) => a.toLowerCase().includes(characterSearch.toLowerCase()))
  )

  // Copy character info to clipboard
  const handleCopyCharacterInfo = async (character: Character) => {
    const info = `【${character.name}】${character.aliases.length > 0 ? `（${character.aliases.join('、')}）` : ''}
${character.description || ''}
${character.personality ? `性格：${character.personality}` : ''}`.trim()

    await navigator.clipboard.writeText(info)
    setCopiedId(character.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!isAiPanelOpen) return null

  return (
    <div
      className="h-full border-l bg-background flex flex-col"
      style={{ width: aiPanelWidth }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <span className="font-medium">AI 助手</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setAiPanelOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={aiPanelTab} onValueChange={(v) => setAiPanelTab(v as 'generate' | 'chat' | 'characters')} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 mx-4 mt-4" style={{ width: 'calc(100% - 32px)' }}>
          <TabsTrigger value="generate">智能续写</TabsTrigger>
          <TabsTrigger value="chat">对话助手</TabsTrigger>
          <TabsTrigger value="characters" className="gap-1">
            <Users className="h-3 w-3" />
            人物
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="flex-1 flex flex-col mt-0 p-4 space-y-4 overflow-hidden">
          {/* Writing mode selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">写作模式</label>
            <div className="grid grid-cols-1 gap-2">
              {writingModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setCurrentMode(mode.value)}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border text-left transition-colors',
                    currentMode === mode.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                      : 'hover:bg-muted'
                  )}
                >
                  <mode.icon className={cn(
                    'h-5 w-5 mt-0.5',
                    currentMode === mode.value ? 'text-purple-500' : 'text-muted-foreground'
                  )} />
                  <div>
                    <div className="font-medium text-sm">{mode.label}</div>
                    <div className="text-xs text-muted-foreground">{mode.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Plan options (if available) */}
          {planOptions.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">选择剧情走向</label>
              <div className="space-y-2">
                {planOptions.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan.id)}
                    className={cn(
                      'w-full p-3 rounded-lg border text-left transition-colors',
                      selectedPlanId === plan.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                        : 'hover:bg-muted'
                    )}
                  >
                    <div className="font-medium text-sm">{plan.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{plan.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Instruction input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">写作指令（可选）</label>
            <Textarea
              placeholder="例如：描写一场激烈的战斗、让主角获得新技能..."
              value={generateInput}
              onChange={(e) => setGenerateInput(e.target.value)}
              rows={3}
            />
          </div>

          {/* Generate button */}
          <Button
            onClick={isGenerating ? cancelGeneration : handleGenerate}
            variant={isGenerating ? 'destructive' : 'default'}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <X className="h-4 w-4" />
                停止生成 (ESC)
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                开始续写
              </>
            )}
          </Button>

          {/* Quick actions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">快捷操作</label>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Badge
                  key={action.label}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleQuickAction(action)}
                >
                  {action.label}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col mt-0 overflow-hidden">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {copilotMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">与 AI 讨论剧情、人物设定...</p>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs">试试问：</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-muted text-xs"
                        onClick={() => {
                          setChatInput('这段剧情的节奏如何？')
                        }}
                      >
                        这段剧情的节奏如何？
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-muted text-xs"
                        onClick={() => {
                          setChatInput('帮我分析一下主角的性格')
                        }}
                      >
                        帮我分析一下主角的性格
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                copilotMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    思考中...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                placeholder="问问 AI..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendChat()
                  }
                }}
                rows={2}
                className="resize-none"
              />
              <Button
                size="icon"
                onClick={handleSendChat}
                disabled={!chatInput.trim() || isChatLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Characters Tab */}
        <TabsContent value="characters" className="flex-1 flex flex-col mt-0 overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索人物..."
                value={characterSearch}
                onChange={(e) => setCharacterSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Character List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {charactersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredCharacters.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {characterSearch ? '没有找到匹配的人物' : '暂无人物设定'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    在「设定百科」中添加人物
                  </p>
                </div>
              ) : (
                filteredCharacters.map((character) => (
                  <div
                    key={character.id}
                    className={cn(
                      'rounded-lg border p-3 transition-all cursor-pointer',
                      expandedCharacterId === character.id
                        ? 'bg-muted/50 border-primary/50'
                        : 'hover:bg-muted/30'
                    )}
                    onClick={() =>
                      setExpandedCharacterId(
                        expandedCharacterId === character.id ? null : character.id
                      )
                    }
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={character.avatar_url || undefined} />
                        <AvatarFallback className="text-sm">
                          {character.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {character.name}
                          </span>
                          {character.is_protagonist && (
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        {character.aliases.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate">
                            {character.aliases.join('、')}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyCharacterInfo(character)
                        }}
                        title="复制人物信息"
                      >
                        {copiedId === character.id ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>

                    {/* Expanded details */}
                    {expandedCharacterId === character.id && (
                      <div className="mt-3 pt-3 border-t space-y-2 text-sm">
                        {character.description && (
                          <p className="text-muted-foreground">
                            {character.description}
                          </p>
                        )}
                        {character.personality && (
                          <div>
                            <span className="text-xs font-medium">性格：</span>
                            <span className="text-xs text-muted-foreground">
                              {character.personality}
                            </span>
                          </div>
                        )}
                        {character.background && (
                          <div>
                            <span className="text-xs font-medium">背景：</span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {character.background}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer hint */}
          <div className="p-3 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              点击复制图标将人物信息插入文档
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
