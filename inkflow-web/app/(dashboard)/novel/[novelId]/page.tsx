'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Users,
  MapPin,
  Sword,
  Network,
  Play,
  Clock,
  TrendingUp,
  BarChart3,
  Loader2
} from 'lucide-react'
import { useNovel, useChapters, useCharacters, useLocations, useItems } from '@/lib/hooks/useNovels'

export default function NovelOverviewPage() {
  const params = useParams()
  const novelId = params.novelId as string

  const { data: novel, isLoading: novelLoading, error: novelError } = useNovel(novelId)
  const { data: chapters = [] } = useChapters(novelId)
  const { data: characters = [] } = useCharacters(novelId)
  const { data: locations = [] } = useLocations(novelId)
  const { data: items = [] } = useItems(novelId)

  if (novelLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="加载中..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (novelError || !novel) {
    return (
      <div className="flex flex-col h-full">
        <Header title="错误" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-destructive">
            {novelError?.message || '小说不存在或无权访问'}
          </p>
        </div>
      </div>
    )
  }

  // Get target word count from settings or use a default
  const settings = novel.settings as { targetWordCount?: number } | null
  const targetWordCount = settings?.targetWordCount || 200000
  const progress = (novel.word_count / targetWordCount) * 100

  const quickLinks = [
    {
      title: '继续写作',
      description: '打开编辑器继续创作',
      href: `/novel/${novelId}/editor`,
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: '人物管理',
      description: `${characters.length} 个人物`,
      href: `/novel/${novelId}/wiki/characters`,
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: '地点管理',
      description: `${locations.length} 个地点`,
      href: `/novel/${novelId}/wiki/locations`,
      icon: MapPin,
      color: 'text-amber-500',
    },
    {
      title: '物品/功法',
      description: `${items.length} 个条目`,
      href: `/novel/${novelId}/wiki/items`,
      icon: Sword,
      color: 'text-purple-500',
    },
    {
      title: '关系图谱',
      description: '可视化人物关系',
      href: `/novel/${novelId}/graph`,
      icon: Network,
      color: 'text-pink-500',
    },
    {
      title: '大纲编辑',
      description: '规划故事结构',
      href: `/novel/${novelId}/outline`,
      icon: BarChart3,
      color: 'text-cyan-500',
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title={novel.title} />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Hero section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{novel.title}</h1>
                  {novel.genre && <Badge>{novel.genre}</Badge>}
                </div>
                <p className="text-muted-foreground max-w-2xl">
                  {novel.description || '暂无简介'}
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{chapters.length} 章</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{(novel.word_count / 10000).toFixed(1)}万字</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>更新于 {new Date(novel.updated_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
              </div>
              <Link href={`/novel/${novelId}/editor`}>
                <Button size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  继续写作
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Progress card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">写作进度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>当前字数: {(novel.word_count / 10000).toFixed(1)}万</span>
                <span>目标: {(targetWordCount / 10000).toFixed(0)}万</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                已完成 {progress.toFixed(1)}%，距离目标还差 {((targetWordCount - novel.word_count) / 10000).toFixed(1)}万字
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick links */}
        <div>
          <h2 className="text-lg font-semibold mb-4">快速访问</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg bg-secondary ${link.color}`}>
                        <link.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{link.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">内容统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold">{chapters.length}</div>
                <div className="text-sm text-muted-foreground">章节</div>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold">{characters.length}</div>
                <div className="text-sm text-muted-foreground">人物</div>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold">{locations.length}</div>
                <div className="text-sm text-muted-foreground">地点</div>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold">{items.length}</div>
                <div className="text-sm text-muted-foreground">物品</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
