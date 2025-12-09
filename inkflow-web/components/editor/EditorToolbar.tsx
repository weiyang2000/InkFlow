'use client'

import { type Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Sparkles,
  MessageSquare,
  Settings2
} from 'lucide-react'
import { useUIStore } from '@/lib/store'

interface EditorToolbarProps {
  editor: Editor
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const { toggleAiPanel, isAiPanelOpen } = useUIStore()

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    icon: Icon,
    tooltip,
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    icon: React.ElementType
    tooltip: string
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? 'secondary' : 'ghost'}
            size="icon"
            onClick={onClick}
            disabled={disabled}
            className="h-8 w-8"
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b bg-muted/30">
      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        icon={Undo}
        tooltip="撤销 (⌘Z)"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        icon={Redo}
        tooltip="重做 (⌘⇧Z)"
      />

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        icon={Heading1}
        tooltip="标题 1"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        icon={Heading2}
        tooltip="标题 2"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        icon={Heading3}
        tooltip="标题 3"
      />

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        icon={Bold}
        tooltip="粗体 (⌘B)"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        icon={Italic}
        tooltip="斜体 (⌘I)"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        icon={Strikethrough}
        tooltip="删除线"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        icon={Code}
        tooltip="代码"
      />

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        icon={List}
        tooltip="无序列表"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        icon={ListOrdered}
        tooltip="有序列表"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        icon={Quote}
        tooltip="引用"
      />

      <div className="flex-1" />

      {/* AI actions */}
      <Separator orientation="vertical" className="mx-2 h-6" />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isAiPanelOpen ? 'secondary' : 'outline'}
              size="sm"
              onClick={toggleAiPanel}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              AI 助手
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>打开 AI 助手面板</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
