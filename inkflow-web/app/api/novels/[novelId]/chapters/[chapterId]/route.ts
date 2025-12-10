import { NextRequest, NextResponse } from 'next/server'
import { createClient, getServerUser } from '@/lib/supabase/server'
import type { ChapterUpdate, Database } from '@/lib/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

type TypedSupabaseClient = SupabaseClient<Database>

interface RouteParams {
  params: Promise<{ novelId: string; chapterId: string }>
}

// GET /api/novels/[novelId]/chapters/[chapterId] - Get a single chapter
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { novelId, chapterId } = await params
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // 获取章节详情（RLS 会自动验证所有权）
    const { data: chapter, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .eq('novel_id', novelId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '章节不存在或无权访问' },
          { status: 404 }
        )
      }
      console.error('Fetch chapter error:', error)
      return NextResponse.json(
        { error: '获取章节详情失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: chapter,
    })
  } catch (error) {
    console.error('Get chapter error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// PATCH /api/novels/[novelId]/chapters/[chapterId] - Update a chapter
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { novelId, chapterId } = await params
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, summary, volume_id, sort_order, status, outline_data } = body

    // 构建更新对象
    const updates: ChapterUpdate = {}
    if (title !== undefined) updates.title = title.trim()
    if (content !== undefined) {
      updates.content = content
      updates.word_count = countWords(content)
    }
    if (summary !== undefined) updates.summary = summary?.trim() || null
    if (volume_id !== undefined) updates.volume_id = volume_id
    if (sort_order !== undefined) updates.sort_order = sort_order
    if (status !== undefined) updates.status = status
    if (outline_data !== undefined) updates.outline_data = outline_data

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: '没有提供要更新的字段' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 更新章节（RLS 会自动验证所有权）
    const { data: chapter, error } = await supabase
      .from('chapters')
      .update(updates as never)
      .eq('id', chapterId)
      .eq('novel_id', novelId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '章节不存在或无权访问' },
          { status: 404 }
        )
      }
      console.error('Update chapter error:', error)
      return NextResponse.json(
        { error: '更新章节失败' },
        { status: 500 }
      )
    }

    // 如果更新了内容，重新计算小说总字数
    if (content !== undefined) {
      await updateNovelWordCount(supabase, novelId)
    }

    return NextResponse.json({
      success: true,
      data: chapter,
    })
  } catch (error) {
    console.error('Update chapter error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// DELETE /api/novels/[novelId]/chapters/[chapterId] - Delete a chapter
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { novelId, chapterId } = await params
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // 删除章节（RLS 会自动验证所有权）
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId)
      .eq('novel_id', novelId)

    if (error) {
      console.error('Delete chapter error:', error)
      return NextResponse.json(
        { error: '删除章节失败' },
        { status: 500 }
      )
    }

    // 更新小说总字数
    await updateNovelWordCount(supabase, novelId)

    return NextResponse.json({
      success: true,
      message: '章节已删除',
    })
  } catch (error) {
    console.error('Delete chapter error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 计算字数
function countWords(text: string): number {
  if (!text) return 0
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = (text.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z]+/g) || []).length
  return chineseChars + englishWords
}

// 更新小说总字数
async function updateNovelWordCount(supabase: TypedSupabaseClient, novelId: string) {
  const { data: chapters } = await supabase
    .from('chapters')
    .select('word_count')
    .eq('novel_id', novelId) as { data: { word_count: number }[] | null }

  const totalWordCount = chapters?.reduce((sum, ch) => sum + (ch.word_count || 0), 0) || 0

  await supabase
    .from('novels')
    .update({ word_count: totalWordCount } as never)
    .eq('id', novelId)
}
