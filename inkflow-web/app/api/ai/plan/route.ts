import { NextRequest, NextResponse } from 'next/server'
import {
  generateJSON,
  PLAN_SYSTEM_PROMPT,
  buildPlanPrompt,
  loadLLMConfig,
  validateConfig,
} from '@/lib/llm'

interface PlanOption {
  id: string
  title: string
  description: string
  conflictLevel: number
}

interface PlanResponse {
  plans: PlanOption[]
}

// AI Planning API - Director Mode Phase 1
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { novelId, chapterId, instruction, previousContent = '' } = body

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

    // Build prompts
    const userPrompt = buildPlanPrompt({
      previousContent,
      instruction,
      // TODO: Add character context from database
    })

    // Generate plans using LLM
    const messages = [
      { role: 'system' as const, content: PLAN_SYSTEM_PROMPT },
      { role: 'user' as const, content: userPrompt },
    ]

    const response = await generateJSON<PlanResponse>(messages, { temperature: 0.7 }, 'plan')

    // Validate and normalize response
    const plans = (response.plans || []).map((plan, index) => ({
      id: plan.id || String(index + 1),
      title: plan.title || `方案 ${index + 1}`,
      description: plan.description || '',
      conflictLevel: Math.min(100, Math.max(0, plan.conflictLevel || 50)),
    }))

    return NextResponse.json({
      success: true,
      plans,
    })
  } catch (error) {
    console.error('AI Planning error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
