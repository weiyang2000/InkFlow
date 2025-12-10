import { NextRequest, NextResponse } from 'next/server'
import { createClient, getServerUser } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ novelId: string }>
}

// GET /api/novels/[novelId]/wiki - List all wiki entries
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { novelId } = await params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    let query = supabase
      .from('wiki_entries')
      .select('*')
      .eq('novel_id', novelId)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: entries, error } = await query
      .order('category', { ascending: true })
      .order('title', { ascending: true })

    if (error) {
      console.error('Fetch wiki entries error:', error)
      return NextResponse.json(
        { error: '获取百科条目失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: entries || [],
    })
  } catch (error) {
    console.error('Get wiki entries error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// POST /api/novels/[novelId]/wiki - Create a new wiki entry
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
    const { category, title, content, tags } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: '条目标题不能为空' },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { error: '条目类别不能为空' },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: '条目内容不能为空' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: entry, error } = await supabase
      .from('wiki_entries')
      .insert({
        novel_id: novelId,
        category,
        title: title.trim(),
        content: content.trim(),
        tags: tags || [],
      } as never)
      .select()
      .single()

    if (error) {
      console.error('Create wiki entry error:', error)
      return NextResponse.json(
        { error: '创建百科条目失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: entry,
    }, { status: 201 })
  } catch (error) {
    console.error('Create wiki entry error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// PATCH /api/novels/[novelId]/wiki - Update a wiki entry (by id in query)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { novelId } = await params
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('id')

    if (!entryId) {
      return NextResponse.json(
        { error: '缺少条目 ID' },
        { status: 400 }
      )
    }

    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.category !== undefined) updates.category = body.category
    if (body.title !== undefined) updates.title = body.title.trim()
    if (body.content !== undefined) updates.content = body.content.trim()
    if (body.tags !== undefined) updates.tags = body.tags

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: '没有提供要更新的字段' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: entry, error } = await supabase
      .from('wiki_entries')
      .update(updates as never)
      .eq('id', entryId)
      .eq('novel_id', novelId)
      .select()
      .single()

    if (error) {
      console.error('Update wiki entry error:', error)
      return NextResponse.json(
        { error: '更新百科条目失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: entry,
    })
  } catch (error) {
    console.error('Update wiki entry error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// DELETE /api/novels/[novelId]/wiki - Delete a wiki entry (by id in query)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { novelId } = await params
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('id')

    if (!entryId) {
      return NextResponse.json(
        { error: '缺少条目 ID' },
        { status: 400 }
      )
    }

    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('wiki_entries')
      .delete()
      .eq('id', entryId)
      .eq('novel_id', novelId)

    if (error) {
      console.error('Delete wiki entry error:', error)
      return NextResponse.json(
        { error: '删除百科条目失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '百科条目已删除',
    })
  } catch (error) {
    console.error('Delete wiki entry error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
