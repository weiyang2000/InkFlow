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
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNovels, useDeleteNovel } from '@/lib/hooks/useNovels'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'

const genreColors: Record<string, string> = {
  玄幻: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  都市: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  悬疑: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  仙侠: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  科幻: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  历史: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  言情: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
}

const statusLabels: Record<string, string> = {
  draft: '草稿',
  publishing: '连载中',
  completed: '已完结',
  archived: '已归档',
}

export default function DashboardPage() {
  const { data: novels = [], isLoading, error } = useNovels()
  const deleteNovel = useDeleteNovel()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [novelToDelete, setNovelToDelete] = useState<string | null>(null)

  const handleDeleteClick = (novelId: string) => {
    setNovelToDelete(novelId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (novelToDelete) {
      await deleteNovel.mutateAsync(novelToDelete)
      setDeleteDialogOpen(false)
      setNovelToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="我的作品" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <Header title="我的作品" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-destructive">加载失败：{error.message}</p>
        </div>
      </div>
    )
  }

  const totalWordCount = novels.reduce((sum, n) => sum + (n.word_count || 0), 0)
  const publishingCount = novels.filter(n => n.status === 'publishing').length
  const completedCount = novels.filter(n => n.status === 'completed').length

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
              <div className="text-2xl font-bold">{novels.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总字数</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(totalWordCount / 10000).toFixed(1)}万
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">连载中</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已完结</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
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
          {novels.map((novel) => (
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
                      {novel.genre && (
                        <Badge variant="secondary" className={genreColors[novel.genre] || ''}>
                          {novel.genre}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {statusLabels[novel.status] || novel.status}
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
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteClick(novel.id)}
                      >
                        删除作品
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2 mb-4">
                  {novel.description || '暂无简介'}
                </CardDescription>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{(novel.word_count / 10000).toFixed(1)}万字</span>
                  <span>
                    更新于 {new Date(novel.updated_at).toLocaleDateString('zh-CN')}
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

        {novels.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">还没有作品</h3>
            <p className="text-muted-foreground mb-4">
              点击上方按钮创建你的第一部作品
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除作品？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该作品及其所有章节、人物、地点等数据，且无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteNovel.isPending ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
