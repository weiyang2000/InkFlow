'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useCreateNovel } from '@/lib/hooks/useNovels'

const genres = [
  { value: 'fantasy', label: '玄幻' },
  { value: 'wuxia', label: '武侠' },
  { value: 'romance', label: '言情' },
  { value: 'scifi', label: '科幻' },
  { value: 'urban', label: '都市' },
  { value: 'history', label: '历史' },
  { value: 'mystery', label: '悬疑' },
  { value: 'gaming', label: '游戏' },
  { value: 'other', label: '其他' },
]

export default function NewNovelPage() {
  const router = useRouter()
  const createNovel = useCreateNovel()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const novel = await createNovel.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        genre: formData.genre || undefined,
      })

      // Navigate to the new novel's editor
      router.push(`/novel/${novel.id}/editor`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败，请重试')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="创建新作品" showSearch={false} />

      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Back button */}
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回作品列表
            </Button>
          </Link>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>创建新作品</CardTitle>
              <CardDescription>
                填写作品基本信息，开始你的创作之旅
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">作品名称 *</Label>
                  <Input
                    id="title"
                    placeholder="输入作品名称"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Genre */}
                <div className="space-y-2">
                  <Label htmlFor="genre">作品类型</Label>
                  <Select
                    value={formData.genre}
                    onValueChange={(value) =>
                      setFormData({ ...formData, genre: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择作品类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre.value} value={genre.value}>
                          {genre.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">作品简介</Label>
                  <Textarea
                    id="description"
                    placeholder="简单描述你的故事..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* AI suggestion */}
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">AI 创作助手</p>
                        <p className="text-sm text-muted-foreground">
                          创建作品后，AI 将帮助你构建世界观、设计人物、规划大纲，
                          并在写作过程中提供智能续写建议。
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Error message */}
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-3">
                  <Link href="/dashboard">
                    <Button type="button" variant="outline">
                      取消
                    </Button>
                  </Link>
                  <Button type="submit" disabled={createNovel.isPending || !formData.title.trim()}>
                    {createNovel.isPending ? '创建中...' : '创建作品'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
