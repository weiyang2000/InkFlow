import { NextRequest, NextResponse } from 'next/server'
import {
  streamGenerate,
  loadLLMConfig,
  validateConfig,
} from '@/lib/llm'

// Copilot system prompt
const COPILOT_SYSTEM_PROMPT = `你是一位专业的小说创作助手，帮助作者解决写作过程中的各种问题。

你的能力包括：
- 分析人物性格和动机
- 讨论剧情走向和逻辑
- 提供写作建议和技巧
- 帮助解决设定冲突
- 建议场景和对话

回答要求：
- 简洁专业，直击要点
- 给出具体可行的建议
- 必要时举例说明
- 保持对小说创作的热情`

// AI Chat API - Server-Sent Events (SSE) for streaming
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, novelContext } = body

    // Validate LLM configuration
    const config = loadLLMConfig()
    const validation = validateConfig(config)
    if (!validation.valid) {
      return NextResponse.json(
        { error: `LLM configuration error: ${validation.errors.join(', ')}` },
        { status: 500 }
      )
    }

    // Build messages with system prompt
    const chatMessages = [
      { role: 'system' as const, content: COPILOT_SYSTEM_PROMPT },
      ...(novelContext ? [{
        role: 'system' as const,
        content: `当前小说上下文：\n${novelContext}`
      }] : []),
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    // Create a TransformStream for SSE
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Start async generation
    generateChatResponse(writer, encoder, chatMessages)

    // Return SSE response
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateChatResponse(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
) {
  try {
    let fullText = ''

    // Stream tokens from LLM
    for await (const token of streamGenerate(messages, { temperature: 0.7, maxTokens: 1000 }, 'generate')) {
      fullText += token

      // Send token event
      const data = JSON.stringify({ type: 'token', content: token })
      await writer.write(encoder.encode(`data: ${data}\n\n`))
    }

    // Send done event
    const doneData = JSON.stringify({ type: 'done', content: fullText })
    await writer.write(encoder.encode(`data: ${doneData}\n\n`))
  } catch (error) {
    console.error('Chat generation error:', error)

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
