import { NextRequest, NextResponse } from 'next/server'
import type { WritingMode } from '@/lib/types'
import {
  streamGenerate,
  getSystemPrompt,
  buildGeneratePrompt,
  loadLLMConfig,
  validateConfig,
} from '@/lib/llm'
import { createClient, getServerUser } from '@/lib/supabase/server'

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

    // Get user for authentication
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      )
    }

    // Fetch context data from database
    const contextData = await fetchContextData(novelId, chapterId)

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
      ...contextData,
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

// Fetch context data from database
async function fetchContextData(novelId: string, chapterId: string): Promise<{
  chapterOutline?: string
  previousChapterSummary?: string
  characterContext?: string
  locationContext?: string
  itemContext?: string
}> {
  try {
    const supabase = await createClient()

    // Fetch current chapter info (title, summary, sort_order)
    const { data: chapter } = await supabase
      .from('chapters')
      .select('title, summary, sort_order')
      .eq('id', chapterId)
      .single()

    const chapterData = chapter as {
      title?: string
      summary?: string
      sort_order?: number
    } | null

    // Fetch previous chapter (based on sort_order)
    let previousChapterData: {
      title?: string
      summary?: string
      content?: string
    } | null = null

    if (chapterData?.sort_order !== undefined && chapterData.sort_order > 0) {
      const { data: prevChapter } = await supabase
        .from('chapters')
        .select('title, summary, content')
        .eq('novel_id', novelId)
        .lt('sort_order', chapterData.sort_order)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

      previousChapterData = prevChapter as typeof previousChapterData
    }

    // Fetch characters
    const { data: characters } = await supabase
      .from('characters')
      .select('name, aliases, description, personality, background, is_protagonist')
      .eq('novel_id', novelId)
      .order('is_protagonist', { ascending: false })
      .limit(10)

    // Fetch locations
    const { data: locations } = await supabase
      .from('locations')
      .select('name, description, environment_keywords')
      .eq('novel_id', novelId)
      .limit(10)

    // Fetch items
    const { data: items } = await supabase
      .from('items')
      .select('name, category, description')
      .eq('novel_id', novelId)
      .limit(10)

    // Build context strings
    const result: {
      chapterOutline?: string
      previousChapterSummary?: string
      characterContext?: string
      locationContext?: string
      itemContext?: string
    } = {}

    // Current chapter outline
    if (chapterData?.summary) {
      result.chapterOutline = `${chapterData.title}\n${chapterData.summary}`
    }

    // Previous chapter summary/content
    if (previousChapterData) {
      const prevData = previousChapterData as {
        title?: string
        summary?: string
        content?: string
      }
      const prevTitle = prevData.title || '上一章'
      // Prefer summary, fall back to last part of content
      if (prevData.summary) {
        result.previousChapterSummary = `【${prevTitle}】\n${prevData.summary}`
      } else if (prevData.content) {
        // Extract last ~500 characters of content as context (strip HTML tags)
        const plainText = prevData.content.replace(/<[^>]*>/g, '')
        const lastPart = plainText.length > 500
          ? '...' + plainText.slice(-500)
          : plainText
        result.previousChapterSummary = `【${prevTitle}】\n${lastPart}`
      }
    }

    // Character context
    if (characters && characters.length > 0) {
      result.characterContext = (characters as {
        name: string
        aliases?: string[]
        description?: string
        personality?: string
        background?: string
        is_protagonist?: boolean
      }[]).map((char) => {
        const lines = [`【${char.name}】${char.is_protagonist ? '（主角）' : ''}`]
        if (char.aliases && char.aliases.length > 0) {
          lines.push(`别名：${char.aliases.join('、')}`)
        }
        if (char.description) {
          lines.push(`简介：${char.description}`)
        }
        if (char.personality) {
          lines.push(`性格：${char.personality}`)
        }
        if (char.background) {
          lines.push(`背景：${char.background}`)
        }
        return lines.join('\n')
      }).join('\n\n')
    }

    // Location context
    if (locations && locations.length > 0) {
      result.locationContext = (locations as {
        name: string
        description?: string
        environment_keywords?: string[]
      }[]).map((loc) => {
        const lines = [`【${loc.name}】`]
        if (loc.description) {
          lines.push(`描述：${loc.description}`)
        }
        if (loc.environment_keywords && loc.environment_keywords.length > 0) {
          lines.push(`环境关键词：${loc.environment_keywords.join('、')}`)
        }
        return lines.join('\n')
      }).join('\n\n')
    }

    // Item context
    if (items && items.length > 0) {
      result.itemContext = (items as {
        name: string
        category?: string
        description?: string
      }[]).map((item) => {
        const categoryMap: Record<string, string> = {
          weapon: '武器',
          artifact: '神器',
          tool: '工具',
          treasure: '宝物',
          other: '其他',
        }
        const categoryLabel = categoryMap[item.category || 'other'] || item.category
        const lines = [`【${item.name}】（${categoryLabel}）`]
        if (item.description) {
          lines.push(`描述：${item.description}`)
        }
        return lines.join('\n')
      }).join('\n\n')
    }

    return result
  } catch (error) {
    console.error('Failed to fetch context data:', error)
    return {}
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
    chapterOutline?: string
    previousChapterSummary?: string
    characterContext?: string
    locationContext?: string
    itemContext?: string
  }
) {
  try {
    const {
      mode,
      instruction,
      previousContent,
      chapterOutline,
      previousChapterSummary,
      characterContext,
      locationContext,
      itemContext,
    } = params

    // Build prompts
    const systemPrompt = getSystemPrompt(mode)
    const userPrompt = buildGeneratePrompt({
      previousContent,
      instruction,
      mode,
      chapterOutline,
      previousChapterSummary,
      characterContext,
      locationContext,
      itemContext,
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
