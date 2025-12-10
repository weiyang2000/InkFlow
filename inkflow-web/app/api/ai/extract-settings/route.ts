import { NextRequest, NextResponse } from 'next/server'
import {
  generateJSON,
  EXTRACT_SETTINGS_SYSTEM_PROMPT,
  buildExtractSettingsPrompt,
  loadLLMConfig,
  validateConfig,
} from '@/lib/llm'

interface ExtractedCharacter {
  name: string
  aliases?: string[]
  description?: string
  personality?: string
  background?: string
  is_protagonist?: boolean
}

interface ExtractedLocation {
  name: string
  description?: string
  environment_keywords?: string[]
}

interface ExtractedItem {
  name: string
  category: string
  description?: string
}

interface ExtractSettingsResponse {
  characters: ExtractedCharacter[]
  locations: ExtractedLocation[]
  items: ExtractedItem[]
}

// POST /api/ai/extract-settings - Extract settings from outline
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, genre, chapters } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: '缺少必填字段：小说标题' },
        { status: 400 }
      )
    }

    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return NextResponse.json(
        { error: '缺少必填字段：章节大纲' },
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
    const userPrompt = buildExtractSettingsPrompt({
      title,
      description,
      genre,
      chapters,
    })

    // Generate settings using LLM
    const messages = [
      { role: 'system' as const, content: EXTRACT_SETTINGS_SYSTEM_PROMPT },
      { role: 'user' as const, content: userPrompt },
    ]

    const response = await generateJSON<ExtractSettingsResponse>(
      messages,
      { temperature: 0.7, maxTokens: 4000 },
      'extract'
    )

    // Normalize and validate response
    const characters = (response.characters || []).map((char) => ({
      name: char.name || '未命名人物',
      aliases: Array.isArray(char.aliases) ? char.aliases : [],
      description: char.description || null,
      personality: char.personality || null,
      background: char.background || null,
      is_protagonist: char.is_protagonist || false,
    }))

    const locations = (response.locations || []).map((loc) => ({
      name: loc.name || '未命名地点',
      description: loc.description || null,
      environment_keywords: Array.isArray(loc.environment_keywords) ? loc.environment_keywords : [],
    }))

    const items = (response.items || []).map((item) => ({
      name: item.name || '未命名物品',
      category: item.category || 'other',
      description: item.description || null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        characters,
        locations,
        items,
      },
    })
  } catch (error) {
    console.error('AI Extract settings error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    )
  }
}
