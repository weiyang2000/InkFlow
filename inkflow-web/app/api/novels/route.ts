import { NextRequest, NextResponse } from 'next/server'
import { createClient, getServerUser } from '@/lib/supabase/server'

// GET /api/novels - List all novels for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // 获取用户的所有小说，按更新时间排序
    const result = await supabase
      .from('novels')
      .select(`
        *,
        chapters:chapters(count)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    const novels = result.data as (Record<string, unknown> & { chapters?: { count: number }[] })[] | null
    const error = result.error

    if (error) {
      console.error('Fetch novels error:', error)
      return NextResponse.json(
        { error: '获取小说列表失败' },
        { status: 500 }
      )
    }

    // 转换数据格式，添加章节数量
    const novelsWithChapterCount = novels?.map(novel => ({
      ...novel,
      chapterCount: novel.chapters?.[0]?.count || 0,
      chapters: undefined, // 移除嵌套的 chapters 数据
    })) || []

    return NextResponse.json({
      success: true,
      data: novelsWithChapterCount,
    })
  } catch (error) {
    console.error('Get novels error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// POST /api/novels - Create a new novel
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, genre, settings } = body

    // 验证必填字段
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 创建小说
    const result = await supabase
      .from('novels')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        genre: genre || null,
        settings: settings || {},
        status: 'draft',
        word_count: 0,
      } as never)
      .select()
      .single()

    const novel = result.data as Record<string, unknown> | null
    const error = result.error

    if (error) {
      console.error('Create novel error:', error)
      return NextResponse.json(
        { error: '创建小说失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...novel,
        chapterCount: 0,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create novel error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
