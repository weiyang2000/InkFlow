import { NextRequest, NextResponse } from 'next/server'
import {
  generateJSON,
  OUTLINE_SYSTEM_PROMPT,
  buildOutlinePrompt,
  loadLLMConfig,
  validateConfig,
} from '@/lib/llm'

interface OutlineChapter {
  title: string
  summary: string
  conflictLevel: number
}

interface OutlineResponse {
  chapters: OutlineChapter[]
}

// AI Outline Generation API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, genre, chapterCount = 10, existingChapters } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: '缺少必填字段：小说标题' },
        { status: 400 }
      )
    }

    // Validate LLM configuration
    const config = loadLLMConfig()
    const validation = validateConfig(config)
    if (!validation.valid) {
      return NextResponse.json(
        { error: `LLM 配置错误：${validation.errors.join(', ')}` },
        { status: 500 }
      )
    }

    // Build prompts
    const userPrompt = buildOutlinePrompt({
      title,
      description,
      genre,
      chapterCount: Math.min(Math.max(chapterCount, 1), 30), // Limit 1-30 chapters
      existingChapters,
    })

    // Generate outline using LLM
    const messages = [
      { role: 'system' as const, content: OUTLINE_SYSTEM_PROMPT },
      { role: 'user' as const, content: userPrompt },
    ]

    const response = await generateJSON<OutlineResponse>(messages, { temperature: 0.7 }, 'outline')

    // Validate and normalize response
    const chapters = (response.chapters || []).map((chapter, index) => ({
      title: chapter.title || `第${index + 1}章 新章节`,
      summary: chapter.summary || '',
      conflictLevel: Math.min(100, Math.max(0, chapter.conflictLevel || 50)),
    }))

    return NextResponse.json({
      success: true,
      chapters,
    })
  } catch (error) {
    console.error('AI Outline generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    )
  }
}
