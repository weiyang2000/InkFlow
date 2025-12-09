'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Users,
  MapPin,
  Sword,
  Network,
  Settings,
  Play,
  Clock,
  TrendingUp,
  BarChart3
} from 'lucide-react'

// Mock data
const mockNovel = {
  id: '1',
  title: '斗破苍穹：新篇',
  description: '一个少年从废柴逆袭成为斗帝的故事，在这片大陆上，强者为尊，少年萧炎因天赋消失而被家族冷落...',
  genre: '玄幻',
  wordCount: 125000,
  targetWordCount: 200000,
  chapterCount: 48,
  characterCount: 15,
  locationCount: 8,
  itemCount: 23,
  status: 'draft',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
}

export default function NovelOverviewPage() {
  const params = useParams()
  const novelId = params.novelId as string

  const progress = (mockNovel.wordCount / mockNovel.targetWordCount) * 100

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
      description: `${mockNovel.characterCount} 个人物`,
      href: `/novel/${novelId}/wiki/characters`,
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: '地点管理',
      description: `${mockNovel.locationCount} 个地点`,
      href: `/novel/${novelId}/wiki/locations`,
      icon: MapPin,
      color: 'text-amber-500',
    },
    {
      title: '物品/功法',
      description: `${mockNovel.itemCount} 个条目`,
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
      <Header title={mockNovel.title} />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Hero section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{mockNovel.title}</h1>
                  <Badge>{mockNovel.genre}</Badge>
                </div>
                <p className="text-muted-foreground max-w-2xl">
                  {mockNovel.description}
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{mockNovel.chapterCount} 章</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{(mockNovel.wordCount / 10000).toFixed(1)}万字</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>更新于 {mockNovel.updatedAt.toLocaleDateString('zh-CN')}</span>
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
                <span>当前字数: {(mockNovel.wordCount / 10000).toFixed(1)}万</span>
                <span>目标: {(mockNovel.targetWordCount / 10000).toFixed(0)}万</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                已完成 {progress.toFixed(1)}%，距离目标还差 {((mockNovel.targetWordCount - mockNovel.wordCount) / 10000).toFixed(1)}万字
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

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">最近活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: '更新了第48章《决战之巅》', time: '2小时前' },
                { action: '添加新人物「药老」', time: '5小时前' },
                { action: '更新了「炎帝」的人物关系', time: '昨天' },
                { action: '创建新地点「陨落之地」', time: '2天前' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">{activity.action}</span>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
