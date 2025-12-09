'use client'

import { type Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  Strikethrough,
  Sparkles,
  Wand2,
  MessageSquare
} from 'lucide-react'

interface EditorBubbleMenuProps {
  editor: Editor
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const handleAiRewrite = () => {
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    )
    // TODO: Open AI rewrite dialog
    console.log('AI Rewrite:', selectedText)
  }

  return (
    <>
      {/* Basic formatting */}
      <Button
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* AI actions */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        onClick={handleAiRewrite}
      >
        <Wand2 className="h-4 w-4" />
        <span className="text-xs">AI 润色</span>
      </Button>
    </>
  )
}
