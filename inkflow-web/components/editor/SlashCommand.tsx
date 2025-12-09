'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import {
  Sparkles,
  BookOpen,
  Swords,
  Heart,
  Cloud,
  MessageSquare,
  Users,
  MapPin,
  Wand2,
  RefreshCw,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SlashCommand {
  id: string
  title: string
  description: string
  icon: React.ElementType
  category: 'ai' | 'insert' | 'format'
  action: () => void
}

interface SlashCommandMenuProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (command: SlashCommand) => void
  position?: { top: number; left: number }
  searchQuery?: string
}

export function SlashCommandMenu({
  isOpen,
  onClose,
  onSelect,
  position,
  searchQuery = '',
}: SlashCommandMenuProps) {
  const [search, setSearch] = useState(searchQuery)
  const menuRef = useRef<HTMLDivElement>(null)

  // AI commands
  const commands: SlashCommand[] = [
    {
      id: 'continue',
      title: '续写',
      description: '让 AI 继续写作',
      icon: Sparkles,
      category: 'ai',
      action: () => {},
    },
    {
      id: 'continue-plot',
      title: '续写剧情',
      description: '推进故事情节发展',
      icon: ArrowRight,
      category: 'ai',
      action: () => {},
    },
    {
      id: 'continue-battle',
      title: '续写战斗',
      description: '描写激烈的战斗场面',
      icon: Swords,
      category: 'ai',
      action: () => {},
    },
    {
      id: 'continue-romance',
      title: '续写感情',
      description: '描写感情戏和对话',
      icon: Heart,
      category: 'ai',
      action: () => {},
    },
    {
      id: 'describe-environment',
      title: '描写环境',
      description: '添加场景环境描写',
      icon: Cloud,
      category: 'ai',
      action: () => {},
    },
    {
      id: 'add-dialogue',
      title: '添加对话',
      description: '生成角色对话',
      icon: MessageSquare,
      category: 'ai',
      action: () => {},
    },
    {
      id: 'rewrite',
      title: '润色重写',
      description: '重写选中的文本',
      icon: RefreshCw,
      category: 'ai',
      action: () => {},
    },
    {
      id: 'expand',
      title: '扩写',
      description: '扩展当前段落内容',
      icon: Wand2,
      category: 'ai',
      action: () => {},
    },
    {
      id: 'recall-character',
      title: '回顾人物',
      description: '检索人物设定信息',
      icon: Users,
      category: 'insert',
      action: () => {},
    },
    {
      id: 'recall-location',
      title: '回顾地点',
      description: '检索地点设定信息',
      icon: MapPin,
      category: 'insert',
      action: () => {},
    },
    {
      id: 'recall-item',
      title: '回顾物品',
      description: '检索物品设定信息',
      icon: BookOpen,
      category: 'insert',
      action: () => {},
    },
  ]

  // Filter commands based on search
  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase())
  )

  const aiCommands = filteredCommands.filter((cmd) => cmd.category === 'ai')
  const insertCommands = filteredCommands.filter((cmd) => cmd.category === 'insert')

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Update search from props
  useEffect(() => {
    setSearch(searchQuery)
  }, [searchQuery])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-72 rounded-lg border bg-popover shadow-lg"
      style={position ? { top: position.top, left: position.left } : undefined}
    >
      <Command>
        <CommandInput
          placeholder="搜索命令..."
          value={search}
          onValueChange={setSearch}
          autoFocus
        />
        <CommandList>
          <CommandEmpty>没有找到命令</CommandEmpty>

          {aiCommands.length > 0 && (
            <CommandGroup heading="AI 写作">
              {aiCommands.map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => {
                    onSelect(command)
                    onClose()
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <command.icon className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="font-medium text-sm">{command.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {command.description}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {insertCommands.length > 0 && (
            <CommandGroup heading="检索设定">
              {insertCommands.map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => {
                    onSelect(command)
                    onClose()
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <command.icon className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-medium text-sm">{command.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {command.description}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </div>
  )
}

// Hook to manage slash command state
export function useSlashCommand() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [searchQuery, setSearchQuery] = useState('')

  const open = useCallback((pos: { top: number; left: number }, query = '') => {
    setPosition(pos)
    setSearchQuery(query)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setSearchQuery('')
  }, [])

  const updateQuery = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  return {
    isOpen,
    position,
    searchQuery,
    open,
    close,
    updateQuery,
  }
}
