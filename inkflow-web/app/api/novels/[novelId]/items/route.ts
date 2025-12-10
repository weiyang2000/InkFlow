import { NextRequest, NextResponse } from 'next/server'
import { createClient, getServerUser } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ novelId: string }>
}

// GET /api/novels/[novelId]/items - List all items
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

    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .eq('novel_id', novelId)
      .order('category', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Fetch items error:', error)
      return NextResponse.json(
        { error: '获取物品列表失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: items || [],
    })
  } catch (error) {
    console.error('Get items error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// POST /api/novels/[novelId]/items - Create a new item
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
    const { name, category, description, attributes, owner_id, first_appearance_chapter_id } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: '物品名称不能为空' },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { error: '物品类别不能为空' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: item, error } = await supabase
      .from('items')
      .insert({
        novel_id: novelId,
        name: name.trim(),
        category,
        description: description?.trim() || null,
        attributes: attributes || {},
        owner_id: owner_id || null,
        first_appearance_chapter_id: first_appearance_chapter_id || null,
      } as never)
      .select()
      .single()

    if (error) {
      console.error('Create item error:', error)
      return NextResponse.json(
        { error: '创建物品失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: item,
    }, { status: 201 })
  } catch (error) {
    console.error('Create item error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// PATCH /api/novels/[novelId]/items - Update an item (by id in query)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { novelId } = await params
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json(
        { error: '缺少物品 ID' },
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

    if (body.name !== undefined) updates.name = body.name.trim()
    if (body.category !== undefined) updates.category = body.category
    if (body.description !== undefined) updates.description = body.description?.trim() || null
    if (body.attributes !== undefined) updates.attributes = body.attributes
    if (body.owner_id !== undefined) updates.owner_id = body.owner_id
    if (body.first_appearance_chapter_id !== undefined) {
      updates.first_appearance_chapter_id = body.first_appearance_chapter_id
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: '没有提供要更新的字段' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: item, error } = await supabase
      .from('items')
      .update(updates as never)
      .eq('id', itemId)
      .eq('novel_id', novelId)
      .select()
      .single()

    if (error) {
      console.error('Update item error:', error)
      return NextResponse.json(
        { error: '更新物品失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: item,
    })
  } catch (error) {
    console.error('Update item error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// DELETE /api/novels/[novelId]/items - Delete an item (by id in query)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { novelId } = await params
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json(
        { error: '缺少物品 ID' },
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
      .from('items')
      .delete()
      .eq('id', itemId)
      .eq('novel_id', novelId)

    if (error) {
      console.error('Delete item error:', error)
      return NextResponse.json(
        { error: '删除物品失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '物品已删除',
    })
  } catch (error) {
    console.error('Delete item error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
