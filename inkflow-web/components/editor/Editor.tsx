'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Typography from '@tiptap/extension-typography'
import { useEffect, useCallback, useRef, useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { EditorToolbar } from './EditorToolbar'
import { SlashCommandMenu, useSlashCommand, type SlashCommand } from './SlashCommand'
import { cn } from '@/lib/utils'

interface EditorProps {
  initialContent?: string
  onUpdate?: (content: string) => void
  onSlashCommand?: (command: SlashCommand) => void
  onInsertText?: (text: string) => void
  placeholder?: string
  className?: string
}

export function Editor({
  initialContent = '',
  onUpdate,
  onSlashCommand,
  placeholder = '开始写作...',
  className,
}: EditorProps) {
  const { setContent, content, setCurrentMode, streamingContent, isGenerating } = useEditorStore()
  const slashCommand = useSlashCommand()
  const slashStartPosRef = useRef<number | null>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  // Track how much streaming content has been inserted
  const insertedLengthRef = useRef(0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount,
      Typography,
    ],
    content: initialContent,
    immediatelyRender: false, // Prevent SSR hydration mismatch
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg dark:prose-invert',
          'max-w-none focus:outline-none',
          'min-h-[500px] px-8 py-6'
        ),
      },
      handleKeyDown: (view, event) => {
        // Detect "/" key to trigger slash command
        if (event.key === '/' && !slashCommand.isOpen) {
          // Get cursor position in the DOM
          const { from } = view.state.selection
          const coords = view.coordsAtPos(from)

          slashStartPosRef.current = from

          // Open slash command menu at cursor position
          setTimeout(() => {
            slashCommand.open({
              top: coords.bottom + 8,
              left: coords.left,
            })
          }, 10)

          return false // Allow the "/" to be typed
        }

        // Close menu on escape
        if (event.key === 'Escape' && slashCommand.isOpen) {
          slashCommand.close()
          return true
        }

        return false
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setContent(html)
      onUpdate?.(html)

      // Update slash command search query while menu is open
      if (slashCommand.isOpen && slashStartPosRef.current !== null) {
        const { from } = editor.state.selection
        const text = editor.state.doc.textBetween(slashStartPosRef.current, from)

        // If text starts with "/", extract the query
        if (text.startsWith('/')) {
          slashCommand.updateQuery(text.slice(1))
        } else {
          // User deleted the "/" or moved cursor, close menu
          slashCommand.close()
          slashStartPosRef.current = null
        }
      }
    },
  })

  // Sync content from store if it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  // Handle streaming content insertion
  useEffect(() => {
    if (!editor) return

    // Reset tracker when generation stops
    if (!isGenerating) {
      insertedLengthRef.current = 0
      return
    }

    // Only insert new content
    const newContent = streamingContent.slice(insertedLengthRef.current)
    if (newContent) {
      // Insert at the end of the document
      editor.chain().focus().insertContent(newContent).run()
      insertedLengthRef.current = streamingContent.length
    }
  }, [editor, streamingContent, isGenerating])

  // Handle slash command selection
  const handleCommandSelect = useCallback(
    (command: SlashCommand) => {
      if (!editor || slashStartPosRef.current === null) return

      // Delete the "/" and search query from the editor
      const { from } = editor.state.selection
      editor
        .chain()
        .focus()
        .deleteRange({ from: slashStartPosRef.current, to: from })
        .run()

      // Map command ID to writing mode
      const modeMap: Record<string, string> = {
        'continue': 'plot',
        'continue-plot': 'plot',
        'continue-battle': 'battle',
        'continue-romance': 'romance',
        'describe-environment': 'atmosphere',
        'add-dialogue': 'dialogue',
        'rewrite': 'rewrite',
        'expand': 'expand',
      }

      if (modeMap[command.id]) {
        setCurrentMode(modeMap[command.id] as any)
      }

      // Notify parent component
      onSlashCommand?.(command)

      // Reset state
      slashStartPosRef.current = null
      slashCommand.close()
    },
    [editor, onSlashCommand, setCurrentMode, slashCommand]
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        // TODO: Trigger save
        console.log('Save triggered')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!editor) {
    return null
  }

  const wordCount = editor.storage.characterCount?.words() ?? 0
  const charCount = editor.storage.characterCount?.characters() ?? 0

  return (
    <div ref={editorContainerRef} className={cn('flex flex-col h-full relative', className)}>
      {/* Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor content */}
      <div className="flex-1 overflow-auto bg-background">
        <EditorContent editor={editor} />
      </div>

      {/* Slash command menu */}
      <SlashCommandMenu
        isOpen={slashCommand.isOpen}
        onClose={slashCommand.close}
        onSelect={handleCommandSelect}
        position={slashCommand.position}
        searchQuery={slashCommand.searchQuery}
      />

      {/* Footer with word count */}
      <div className="flex items-center justify-between px-4 py-2 border-t text-sm text-muted-foreground bg-muted/30">
        <div className="flex items-center gap-4">
          <span>{wordCount} 字</span>
          <span>{charCount} 字符</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-500">●</span>
          <span>已保存</span>
        </div>
      </div>
    </div>
  )
}
