import { NextRequest, NextResponse } from 'next/server'
import type { WritingMode } from '@/lib/types'
import {
  streamGenerate,
  getSystemPrompt,
  buildGeneratePrompt,
  loadLLMConfig,
  validateConfig,
} from '@/lib/llm'

// AI Generation API - Server-Sent Events (SSE) for streaming
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { novelId, chapterId, mode, instruction, previousContent = '', planId } = body

    // Validate required fields
    if (!novelId || !chapterId) {
      return NextResponse.json(
        { error: 'Missing required fields: novelId, chapterId' },
        { status: 400 }
      )
    }

    // Validate LLM configuration
    const config = loadLLMConfig()
    const validation = validateConfig(config)
    if (!validation.valid) {
      return NextResponse.json(
        { error: `LLM configuration error: ${validation.errors.join(', ')}` },
        { status: 500 }
      )
    }

    // Create a TransformStream for SSE
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Start async generation
    generateContent(writer, encoder, {
      novelId,
      chapterId,
      mode: (mode as WritingMode) || 'plot',
      instruction,
      previousContent,
      planId,
    })

    // Return SSE response
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('AI Generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateContent(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder,
  params: {
    novelId: string
    chapterId: string
    mode: WritingMode
    instruction?: string
    previousContent: string
    planId?: string
  }
) {
  try {
    const { mode, instruction, previousContent } = params

    // Build prompts
    const systemPrompt = getSystemPrompt(mode)
    const userPrompt = buildGeneratePrompt({
      previousContent,
      instruction,
      mode,
      // TODO: Add character and world context from database
    })

    // Generate content using LLM
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ]

    let fullText = ''
    let tokenCount = 0

    // Stream tokens from LLM
    for await (const token of streamGenerate(messages, { temperature: 0.8 }, 'generate')) {
      fullText += token
      tokenCount++

      // Send token event
      const data = JSON.stringify({ type: 'token', content: token })
      await writer.write(encoder.encode(`data: ${data}\n\n`))
    }

    // Calculate word count (Chinese characters + English words)
    const chineseChars = (fullText.match(/[\u4e00-\u9fa5]/g) || []).length
    const englishWords = (fullText.match(/[a-zA-Z]+/g) || []).length
    const wordCount = chineseChars + englishWords

    // Send done event
    const doneData = JSON.stringify({
      type: 'done',
      wordCount,
      tokensUsed: tokenCount,
    })
    await writer.write(encoder.encode(`data: ${doneData}\n\n`))
  } catch (error) {
    console.error('Generation error:', error)

    // Send error event
    const errorData = JSON.stringify({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    await writer.write(encoder.encode(`data: ${errorData}\n\n`))
  } finally {
    await writer.close()
  }
}
