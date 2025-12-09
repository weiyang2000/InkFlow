'use client'

import Link from 'next/link'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  BookOpen,
  Clock,
  FileText,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Mock data for demo
const mockNovels = [
  {
    id: '1',
    title: '斗破苍穹：新篇',
    description: '一个少年从废柴逆袭成为斗帝的故事...',
    genre: '玄幻',
    wordCount: 125000,
    chapterCount: 48,
    status: 'draft',
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: '都市之最强神医',
    description: '退役兵王回归都市，以医术征服世界...',
    genre: '都市',
    wordCount: 89000,
    chapterCount: 35,
    status: 'publishing',
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    title: '诡秘世界',
    description: '穿越到蒸汽朋克世界，成为神秘的占卜师...',
    genre: '悬疑',
    wordCount: 210000,
    chapterCount: 82,
    status: 'completed',
    updatedAt: new Date('2024-01-01'),
  },
]

const genreColors: Record<string, string> = {
  玄幻: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  都市: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  悬疑: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
}

const statusLabels: Record<string, string> = {
  draft: '草稿',
  publishing: '连载中',
  completed: '已完结',
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="我的作品" />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总作品数</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockNovels.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总字数</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(mockNovels.reduce((sum, n) => sum + n.wordCount, 0) / 10000).toFixed(1)}万
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">连载中</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockNovels.filter(n => n.status === 'publishing').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已完结</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockNovels.filter(n => n.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">我的作品</h2>
          <Link href="/novel/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              创建新作品
            </Button>
          </Link>
        </div>

        {/* Novel list */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockNovels.map((novel) => (
            <Card key={novel.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1">
                      <Link
                        href={`/novel/${novel.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {novel.title}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={genreColors[novel.genre]}>
                        {novel.genre}
                      </Badge>
                      <Badge variant="outline">
                        {statusLabels[novel.status]}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/novel/${novel.id}/editor`}>继续写作</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/novel/${novel.id}/settings`}>作品设置</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        删除作品
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2 mb-4">
                  {novel.description}
                </CardDescription>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{novel.chapterCount} 章</span>
                  <span>{(novel.wordCount / 10000).toFixed(1)}万字</span>
                  <span>
                    更新于 {novel.updatedAt.toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create new card */}
          <Link href="/novel/new">
            <Card className="h-full min-h-[200px] flex items-center justify-center border-dashed hover:border-primary hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Plus className="h-8 w-8" />
                <span>创建新作品</span>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
