import { NextRequest, NextResponse } from 'next/server'
import { createClient, getServerUser } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

type TypedSupabaseClient = SupabaseClient<Database>

interface RouteParams {
  params: Promise<{ novelId: string }>
}

// GET /api/novels/[novelId]/chapters - List all chapters
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

    // 先验证小说所有权
    const { data: novel, error: novelError } = await supabase
      .from('novels')
      .select('id')
      .eq('id', novelId)
      .eq('user_id', user.id)
      .single()

    if (novelError || !novel) {
      return NextResponse.json(
        { error: '小说不存在或无权访问' },
        { status: 404 }
      )
    }

    // 获取章节列表
    const { data: chapters, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('novel_id', novelId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Fetch chapters error:', error)
      return NextResponse.json(
        { error: '获取章节列表失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: chapters || [],
    })
  } catch (error) {
    console.error('Get chapters error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// POST /api/novels/[novelId]/chapters - Create a new chapter
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
    const { title, content, summary, volume_id, sort_order, status, outline_data } = body

    // 验证必填字段
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: '章节标题不能为空' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 先验证小说所有权
    const { data: novel, error: novelError } = await supabase
      .from('novels')
      .select('id')
      .eq('id', novelId)
      .eq('user_id', user.id)
      .single()

    if (novelError || !novel) {
      return NextResponse.json(
        { error: '小说不存在或无权访问' },
        { status: 404 }
      )
    }

    // 获取当前最大排序值
    let newSortOrder = sort_order
    if (newSortOrder === undefined) {
      const { data: maxChapter } = await supabase
        .from('chapters')
        .select('sort_order')
        .eq('novel_id', novelId)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single() as { data: { sort_order: number } | null }

      newSortOrder = (maxChapter?.sort_order || 0) + 1
    }

    // 计算字数
    const wordCount = content ? countWords(content) : 0

    // 创建章节
    const { data: chapter, error } = await supabase
      .from('chapters')
      .insert({
        novel_id: novelId,
        title: title.trim(),
        content: content || '',
        summary: summary?.trim() || null,
        volume_id: volume_id || null,
        sort_order: newSortOrder,
        status: status || 'draft',
        word_count: wordCount,
        outline_data: outline_data || null,
      } as never)
      .select()
      .single()

    if (error) {
      console.error('Create chapter error:', error)
      return NextResponse.json(
        { error: '创建章节失败' },
        { status: 500 }
      )
    }

    // 更新小说总字数
    await updateNovelWordCount(supabase, novelId)

    return NextResponse.json({
      success: true,
      data: chapter,
    }, { status: 201 })
  } catch (error) {
    console.error('Create chapter error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 计算字数（中文字符+英文单词）
function countWords(text: string): number {
  if (!text) return 0
  // 计算中文字符
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  // 计算英文单词
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
