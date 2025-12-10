import { NextRequest, NextResponse } from 'next/server'
import { createClient, getServerUser } from '@/lib/supabase/server'

interface CharacterInput {
  name: string
  aliases?: string[]
  description?: string | null
  personality?: string | null
  background?: string | null
  is_protagonist?: boolean
}

interface LocationInput {
  name: string
  description?: string | null
  environment_keywords?: string[]
}

interface ItemInput {
  name: string
  category: string
  description?: string | null
}

interface RouteParams {
  params: Promise<{ novelId: string }>
}

// POST /api/novels/[novelId]/batch-settings - Batch create settings
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
    const { characters, locations, items } = body as {
      characters?: CharacterInput[]
      locations?: LocationInput[]
      items?: ItemInput[]
    }

    const supabase = await createClient()

    // Verify novel ownership via RLS
    const { data: novel, error: novelError } = await supabase
      .from('novels')
      .select('id')
      .eq('id', novelId)
      .single()

    if (novelError || !novel) {
      return NextResponse.json(
        { error: '小说不存在或无权限访问' },
        { status: 404 }
      )
    }

    const results = {
      characters: [] as unknown[],
      locations: [] as unknown[],
      items: [] as unknown[],
      errors: [] as string[],
    }

    // Batch create characters
    if (characters && characters.length > 0) {
      // Check for existing characters to avoid duplicates
      const { data: existingChars } = await supabase
        .from('characters')
        .select('name')
        .eq('novel_id', novelId)

      const existingNames = new Set((existingChars as { name: string }[] | null)?.map(c => c.name.toLowerCase()) || [])
      const newCharacters = characters.filter(c => !existingNames.has(c.name.toLowerCase()))

      if (newCharacters.length > 0) {
        const { data: createdChars, error: charError } = await supabase
          .from('characters')
          .insert(
            newCharacters.map((char) => ({
              novel_id: novelId,
              name: char.name.trim(),
              aliases: char.aliases || [],
              description: char.description || null,
              personality: char.personality || null,
              background: char.background || null,
              is_protagonist: char.is_protagonist || false,
              attributes: {},
            })) as never
          )
          .select()

        if (charError) {
          console.error('Batch create characters error:', charError)
          results.errors.push(`人物创建失败: ${charError.message}`)
        } else {
          results.characters = createdChars || []
        }
      }

      // Report skipped characters
      const skipped = characters.length - newCharacters.length
      if (skipped > 0) {
        results.errors.push(`跳过 ${skipped} 个已存在的人物`)
      }
    }

    // Batch create locations
    if (locations && locations.length > 0) {
      // Check for existing locations to avoid duplicates
      const { data: existingLocs } = await supabase
        .from('locations')
        .select('name')
        .eq('novel_id', novelId)

      const existingLocNames = new Set((existingLocs as { name: string }[] | null)?.map(l => l.name.toLowerCase()) || [])
      const newLocations = locations.filter(l => !existingLocNames.has(l.name.toLowerCase()))

      if (newLocations.length > 0) {
        const { data: createdLocs, error: locError } = await supabase
          .from('locations')
          .insert(
            newLocations.map((loc) => ({
              novel_id: novelId,
              name: loc.name.trim(),
              description: loc.description || null,
              environment_keywords: loc.environment_keywords || [],
            })) as never
          )
          .select()

        if (locError) {
          console.error('Batch create locations error:', locError)
          results.errors.push(`地点创建失败: ${locError.message}`)
        } else {
          results.locations = createdLocs || []
        }
      }

      // Report skipped locations
      const skipped = locations.length - newLocations.length
      if (skipped > 0) {
        results.errors.push(`跳过 ${skipped} 个已存在的地点`)
      }
    }

    // Batch create items
    if (items && items.length > 0) {
      // Check for existing items to avoid duplicates
      const { data: existingItems } = await supabase
        .from('items')
        .select('name')
        .eq('novel_id', novelId)

      const existingItemNames = new Set((existingItems as { name: string }[] | null)?.map(i => i.name.toLowerCase()) || [])
      const newItems = items.filter(i => !existingItemNames.has(i.name.toLowerCase()))

      if (newItems.length > 0) {
        const { data: createdItems, error: itemError } = await supabase
          .from('items')
          .insert(
            newItems.map((item) => ({
              novel_id: novelId,
              name: item.name.trim(),
              category: item.category || 'other',
              description: item.description || null,
              attributes: {},
            })) as never
          )
          .select()

        if (itemError) {
          console.error('Batch create items error:', itemError)
          results.errors.push(`物品创建失败: ${itemError.message}`)
        } else {
          results.items = createdItems || []
        }
      }

      // Report skipped items
      const skipped = items.length - newItems.length
      if (skipped > 0) {
        results.errors.push(`跳过 ${skipped} 个已存在的物品`)
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      summary: {
        charactersCreated: results.characters.length,
        locationsCreated: results.locations.length,
        itemsCreated: results.items.length,
        warnings: results.errors,
      },
    })
  } catch (error) {
    console.error('Batch create settings error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
