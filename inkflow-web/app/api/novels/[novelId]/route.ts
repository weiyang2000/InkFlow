import { NextRequest, NextResponse } from 'next/server'
import { createClient, getServerUser } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ novelId: string }>
}

// GET /api/novels/[novelId] - Get a single novel
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

    // 获取小说详情，包括章节数量
    const result = await supabase
      .from('novels')
      .select(`
        *,
        chapters:chapters(count),
        volumes:volumes(*)
      `)
      .eq('id', novelId)
      .eq('user_id', user.id)
      .single()

    const novel = result.data as Record<string, unknown> & { chapters?: { count: number }[] } | null
    const error = result.error

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '小说不存在或无权访问' },
          { status: 404 }
        )
      }
      console.error('Fetch novel error:', error)
      return NextResponse.json(
        { error: '获取小说详情失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...novel,
        chapterCount: novel?.chapters?.[0]?.count || 0,
        chapters: undefined,
      },
    })
  } catch (error) {
    console.error('Get novel error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// PATCH /api/novels/[novelId] - Update a novel
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const { title, description, genre, status, settings, cover_url } = body

    // 构建更新对象，只包含提供的字段
    const updates: Record<string, unknown> = {}
    if (title !== undefined) updates.title = title.trim()
    if (description !== undefined) updates.description = description?.trim() || null
    if (genre !== undefined) updates.genre = genre
    if (status !== undefined) updates.status = status
    if (settings !== undefined) updates.settings = settings
    if (cover_url !== undefined) updates.cover_url = cover_url

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: '没有提供要更新的字段' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 更新小说
    const { data: novel, error } = await supabase
      .from('novels')
      .update(updates as never)
      .eq('id', novelId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '小说不存在或无权访问' },
          { status: 404 }
        )
      }
      console.error('Update novel error:', error)
      return NextResponse.json(
        { error: '更新小说失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: novel,
    })
  } catch (error) {
    console.error('Update novel error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// DELETE /api/novels/[novelId] - Delete a novel
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // 删除小说（级联删除会自动删除关联的章节、人物等）
    const { error } = await supabase
      .from('novels')
      .delete()
      .eq('id', novelId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Delete novel error:', error)
      return NextResponse.json(
        { error: '删除小说失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '小说已删除',
    })
  } catch (error) {
    console.error('Delete novel error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
