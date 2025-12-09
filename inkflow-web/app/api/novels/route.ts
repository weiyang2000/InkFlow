import { NextRequest, NextResponse } from 'next/server'

// Novels CRUD API

// GET /api/novels - List all novels for current user
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from session
    // TODO: Fetch from database

    // Mock data
    const novels = [
      {
        id: '1',
        title: '斗破苍穹：新篇',
        description: '一个少年从废柴逆袭成为斗帝的故事...',
        genre: 'fantasy',
        wordCount: 125000,
        chapterCount: 48,
        status: 'draft',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        title: '都市之最强神医',
        description: '退役兵王回归都市，以医术征服世界...',
        genre: 'urban',
        wordCount: 89000,
        chapterCount: 35,
        status: 'publishing',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-10'),
      },
    ]

    return NextResponse.json({
      success: true,
      data: novels,
    })
  } catch (error) {
    console.error('Get novels error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/novels - Create a new novel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, genre } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // TODO: Get user from session
    // TODO: Save to database

    // Mock created novel
    const novel = {
      id: Math.random().toString(36).substring(7),
      title,
      description: description || '',
      genre: genre || 'other',
      wordCount: 0,
      chapterCount: 0,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return NextResponse.json({
      success: true,
      data: novel,
    }, { status: 201 })
  } catch (error) {
    console.error('Create novel error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
