import { NextRequest, NextResponse } from 'next/server'
import { createClient, getServerUser } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ novelId: string; characterId: string }>
}

// GET /api/novels/[novelId]/characters/[characterId] - Get a single character
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { novelId, characterId } = await params
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    const { data: character, error } = await supabase
      .from('characters')
      .select(`
        *,
        relationships_from:character_relationships!from_character_id(*),
        relationships_to:character_relationships!to_character_id(*)
      `)
      .eq('id', characterId)
      .eq('novel_id', novelId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '人物不存在或无权访问' },
          { status: 404 }
        )
      }
      console.error('Fetch character error:', error)
      return NextResponse.json(
        { error: '获取人物详情失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: character,
    })
  } catch (error) {
    console.error('Get character error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// PATCH /api/novels/[novelId]/characters/[characterId] - Update a character
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { novelId, characterId } = await params
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updates: Record<string, unknown> = {}

    const allowedFields = [
      'name', 'aliases', 'avatar_url', 'description',
      'personality', 'background', 'attributes',
      'first_appearance_chapter_id', 'is_protagonist'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'name') {
          updates[field] = body[field]?.trim()
        } else if (['description', 'personality', 'background'].includes(field)) {
          updates[field] = body[field]?.trim() || null
        } else {
          updates[field] = body[field]
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: '没有提供要更新的字段' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: character, error } = await supabase
      .from('characters')
      .update(updates as never)
      .eq('id', characterId)
      .eq('novel_id', novelId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '人物不存在或无权访问' },
          { status: 404 }
        )
      }
      console.error('Update character error:', error)
      return NextResponse.json(
        { error: '更新人物失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: character,
    })
  } catch (error) {
    console.error('Update character error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// DELETE /api/novels/[novelId]/characters/[characterId] - Delete a character
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { novelId, characterId } = await params
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', characterId)
      .eq('novel_id', novelId)

    if (error) {
      console.error('Delete character error:', error)
      return NextResponse.json(
        { error: '删除人物失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '人物已删除',
    })
  } catch (error) {
    console.error('Delete character error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
