'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sparkles,
  Send,
  X,
  Loader2,
  Wand2,
  BookOpen,
  Target,
  Lightbulb,
} from 'lucide-react'
import { useEditorStore, useUIStore } from '@/lib/store'
import { useAiGenerate, useAiChat } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import type { WritingMode } from '@/lib/types'

export function EditorSidebar() {
  const params = useParams()
  const novelId = params.novelId as string
  const scrollRef = useRef<HTMLDivElement>(null)

  const { isAiPanelOpen, setAiPanelOpen, aiPanelWidth } = useUIStore()
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
  const [activeTab, setActiveTab] = useState<'generate' | 'chat'>('generate')

  // AI Generate hook
  const { generate, isGenerating } = useAiGenerate({
    novelId,
    chapterId: '1', // TODO: Get actual chapter ID
    onComplete: (text, wordCount) => {
      console.log(`Generated ${wordCount} characters`)
      setGenerateInput('')
    },
    onError: (error) => {
      console.error('Generation error:', error)
    },
  })

  // AI Chat hook
  const { sendMessage, isLoading: isChatLoading } = useAiChat()

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
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'generate' | 'chat')} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2 mx-4 mt-4" style={{ width: 'calc(100% - 32px)' }}>
          <TabsTrigger value="generate">智能续写</TabsTrigger>
          <TabsTrigger value="chat">对话助手</TabsTrigger>
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
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                生成中...
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
      </Tabs>
    </div>
  )
}
