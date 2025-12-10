import { NextRequest, NextResponse } from 'next/server'
import { createClient, getServerUser } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ novelId: string }>
}

// GET /api/novels/[novelId]/characters - List all characters
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { novelId } = await params
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // 获取人物列表（RLS 自动验证所有权）
    const { data: characters, error } = await supabase
      .from('characters')
      .select('*')
      .eq('novel_id', novelId)
      .order('is_protagonist', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Fetch characters error:', error)
      return NextResponse.json(
        { error: '获取人物列表失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: characters || [],
    })
  } catch (error) {
    console.error('Get characters error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// POST /api/novels/[novelId]/characters - Create a new character
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { novelId } = await params
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      aliases,
      avatar_url,
      description,
      personality,
      background,
      attributes,
      first_appearance_chapter_id,
      is_protagonist,
    } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: '人物名称不能为空' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 创建人物
    const { data: character, error } = await supabase
      .from('characters')
      .insert({
        novel_id: novelId,
        name: name.trim(),
        aliases: aliases || [],
        avatar_url: avatar_url || null,
        description: description?.trim() || null,
        personality: personality?.trim() || null,
        background: background?.trim() || null,
        attributes: attributes || {},
        first_appearance_chapter_id: first_appearance_chapter_id || null,
        is_protagonist: is_protagonist || false,
      } as never)
      .select()
      .single()

    if (error) {
      console.error('Create character error:', error)
      return NextResponse.json(
        { error: '创建人物失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: character,
    }, { status: 201 })
  } catch (error) {
    console.error('Create character error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
