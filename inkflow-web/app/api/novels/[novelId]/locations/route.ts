import { NextRequest, NextResponse } from 'next/server'
import { createClient, getServerUser } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ novelId: string }>
}

// GET /api/novels/[novelId]/locations - List all locations
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

    const { data: locations, error } = await supabase
      .from('locations')
      .select('*')
      .eq('novel_id', novelId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Fetch locations error:', error)
      return NextResponse.json(
        { error: '获取地点列表失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: locations || [],
    })
  } catch (error) {
    console.error('Get locations error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// POST /api/novels/[novelId]/locations - Create a new location
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
    const { name, parent_id, description, environment_keywords, map_data } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: '地点名称不能为空' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: location, error } = await supabase
      .from('locations')
      .insert({
        novel_id: novelId,
        name: name.trim(),
        parent_id: parent_id || null,
        description: description?.trim() || null,
        environment_keywords: environment_keywords || [],
        map_data: map_data || null,
      } as never)
      .select()
      .single()

    if (error) {
      console.error('Create location error:', error)
      return NextResponse.json(
        { error: '创建地点失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: location,
    }, { status: 201 })
  } catch (error) {
    console.error('Create location error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// PATCH /api/novels/[novelId]/locations - Update a location (by id in query)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { novelId } = await params
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('id')

    if (!locationId) {
      return NextResponse.json(
        { error: '缺少地点 ID' },
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
    if (body.parent_id !== undefined) updates.parent_id = body.parent_id
    if (body.description !== undefined) updates.description = body.description?.trim() || null
    if (body.environment_keywords !== undefined) updates.environment_keywords = body.environment_keywords
    if (body.map_data !== undefined) updates.map_data = body.map_data

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: '没有提供要更新的字段' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: location, error } = await supabase
      .from('locations')
      .update(updates as never)
      .eq('id', locationId)
      .eq('novel_id', novelId)
      .select()
      .single()

    if (error) {
      console.error('Update location error:', error)
      return NextResponse.json(
        { error: '更新地点失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: location,
    })
  } catch (error) {
    console.error('Update location error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// DELETE /api/novels/[novelId]/locations - Delete a location (by id in query)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { novelId } = await params
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('id')

    if (!locationId) {
      return NextResponse.json(
        { error: '缺少地点 ID' },
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
      .from('locations')
      .delete()
      .eq('id', locationId)
      .eq('novel_id', novelId)

    if (error) {
      console.error('Delete location error:', error)
      return NextResponse.json(
        { error: '删除地点失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '地点已删除',
    })
  } catch (error) {
    console.error('Delete location error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
