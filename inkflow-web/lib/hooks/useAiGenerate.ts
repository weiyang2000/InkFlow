import { useState, useCallback, useRef, useEffect } from 'react'
import { useEditorStore } from '@/lib/store'
import type { WritingMode, GenerateStreamEvent, PlanOption } from '@/lib/types'

interface UseAiGenerateOptions {
  novelId: string
  chapterId: string
  onToken?: (token: string) => void
  onComplete?: (text: string, wordCount: number) => void
  onError?: (error: string) => void
}

export function useAiGenerate(options: UseAiGenerateOptions) {
  const { novelId, chapterId, onToken, onComplete, onError } = options

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedText, setGeneratedText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const {
    setIsGenerating: setStoreGenerating,
    setStreamingContent,
    appendStreamingContent,
    clearStreamingContent,
    currentMode,
    content,
  } = useEditorStore()

  // Use ref to always get latest content without adding to dependencies
  const contentRef = useRef(content)
  useEffect(() => {
    contentRef.current = content
  }, [content])

  const generate = useCallback(
    async (instruction?: string, mode?: WritingMode, planId?: string) => {
      // Reset state
      setIsGenerating(true)
      setStoreGenerating(true)
      setGeneratedText('')
      setError(null)
      clearStreamingContent()

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController()

      // Extract plain text from HTML content for context (last ~2000 chars)
      const extractTextFromHtml = (html: string): string => {
        const text = html.replace(/<[^>]*>/g, '')
        // Take last 2000 characters for context
        return text.length > 2000 ? text.slice(-2000) : text
      }

      // Get latest content from ref
      const previousContent = extractTextFromHtml(contentRef.current)

      try {
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            novelId,
            chapterId,
            mode: mode || currentMode,
            instruction,
            previousContent,
            planId,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        }

        if (!response.body) {
          throw new Error('No response body')
        }

        // Read SSE stream
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullText = ''

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)

              try {
                const event: GenerateStreamEvent = JSON.parse(data)

                switch (event.type) {
                  case 'token':
                    if (event.content) {
                      fullText += event.content
                      setGeneratedText(fullText)
                      appendStreamingContent(event.content)
                      onToken?.(event.content)
                    }
                    break

                  case 'done':
                    onComplete?.(fullText, event.wordCount || fullText.length)
                    break

                  case 'error':
                    throw new Error(event.error || 'Unknown error')
                }
              } catch (parseError) {
                // Skip invalid JSON lines
                console.warn('Failed to parse SSE data:', data)
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Generation cancelled')
        } else {
          const errorMessage = err instanceof Error ? err.message : 'Generation failed'
          setError(errorMessage)
          onError?.(errorMessage)
        }
      } finally {
        setIsGenerating(false)
        setStoreGenerating(false)
        abortControllerRef.current = null
      }
    },
    [
      novelId,
      chapterId,
      currentMode,
      setStoreGenerating,
      appendStreamingContent,
      clearStreamingContent,
      onToken,
      onComplete,
      onError,
    ]
  )

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const reset = useCallback(() => {
    setGeneratedText('')
    setError(null)
    clearStreamingContent()
  }, [clearStreamingContent])

  return {
    generate,
    cancel,
    reset,
    isGenerating,
    generatedText,
    error,
  }
}

// Hook for AI planning (Director Mode)
interface UseAiPlanOptions {
  novelId: string
  chapterId: string
}

export function useAiPlan(options: UseAiPlanOptions) {
  const { novelId, chapterId } = options

  const [isPlanning, setIsPlanning] = useState(false)
  const [plans, setPlans] = useState<PlanOption[]>([])
  const [error, setError] = useState<string | null>(null)

  const { setPlanOptions, clearPlanOptions } = useEditorStore()

  const fetchPlans = useCallback(
    async (instruction?: string) => {
      setIsPlanning(true)
      setError(null)

      try {
        const response = await fetch('/api/ai/plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            novelId,
            chapterId,
            instruction,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        }

        const data = await response.json()

        if (data.success && data.plans) {
          setPlans(data.plans)
          setPlanOptions(data.plans)
        } else {
          throw new Error(data.error || 'Failed to get plans')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Planning failed'
        setError(errorMessage)
      } finally {
        setIsPlanning(false)
      }
    },
    [novelId, chapterId, setPlanOptions]
  )

  const reset = useCallback(() => {
    setPlans([])
    setError(null)
    clearPlanOptions()
  }, [clearPlanOptions])

  return {
    fetchPlans,
    reset,
    isPlanning,
    plans,
    error,
  }
}

// Hook for RAG search
interface UseRagSearchOptions {
  novelId: string
}

export function useRagSearch(options: UseRagSearchOptions) {
  const { novelId } = options

  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<Array<{
    type: string
    id: string
    title: string
    content: string
    score: number
  }>>([])
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(
    async (query: string, limit = 5) => {
      setIsSearching(true)
      setError(null)

      try {
        // TODO: Implement actual RAG search API
        // For now, return mock results
        await new Promise((resolve) => setTimeout(resolve, 300))

        const mockResults = [
          {
            type: 'character',
            id: '1',
            title: '萧炎',
            content: '曾经的天才少年，三年间斗气尽失...',
            score: 0.95,
          },
          {
            type: 'wiki',
            id: '2',
            title: '斗气等级',
            content: '斗者、斗师、大斗师、斗灵、斗王...',
            score: 0.87,
          },
        ]

        setResults(mockResults)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Search failed'
        setError(errorMessage)
      } finally {
        setIsSearching(false)
      }
    },
    [novelId]
  )

  const reset = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return {
    search,
    reset,
    isSearching,
    results,
    error,
  }
}

// Hook for AI chat (Copilot)
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function useAiChat() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const { copilotMessages, addCopilotMessage } = useEditorStore()

  const sendMessage = useCallback(
    async (content: string, novelContext?: string) => {
      if (!content.trim()) return

      // Add user message
      addCopilotMessage({ role: 'user', content })

      setIsLoading(true)
      setError(null)
      abortControllerRef.current = new AbortController()

      try {
        // Build messages array from history
        const messages: ChatMessage[] = [
          ...copilotMessages,
          { role: 'user', content },
        ]

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            novelContext,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        }

        if (!response.body) {
          throw new Error('No response body')
        }

        // Read SSE stream
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let assistantContent = ''
        let hasAddedMessage = false

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)

              try {
                const event = JSON.parse(data)

                switch (event.type) {
                  case 'token':
                    if (event.content) {
                      assistantContent += event.content
                      // Update message in real-time (we'll add it once at the end)
                    }
                    break

                  case 'done':
                    // Add complete assistant message
                    if (!hasAddedMessage && assistantContent) {
                      addCopilotMessage({ role: 'assistant', content: assistantContent })
                      hasAddedMessage = true
                    }
                    break

                  case 'error':
                    throw new Error(event.error || 'Unknown error')
                }
              } catch (parseError) {
                // Skip invalid JSON lines
                console.warn('Failed to parse SSE data:', data)
              }
            }
          }
        }

        // Ensure message is added even if done event wasn't received
        if (!hasAddedMessage && assistantContent) {
          addCopilotMessage({ role: 'assistant', content: assistantContent })
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Chat cancelled')
        } else {
          const errorMessage = err instanceof Error ? err.message : 'Chat failed'
          setError(errorMessage)
          addCopilotMessage({
            role: 'assistant',
            content: `抱歉，发生错误：${errorMessage}`,
          })
        }
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [copilotMessages, addCopilotMessage]
  )

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return {
    sendMessage,
    cancel,
    isLoading,
    error,
    messages: copilotMessages,
  }
}
