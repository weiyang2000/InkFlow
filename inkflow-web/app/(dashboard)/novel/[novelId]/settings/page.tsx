'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Save, Trash2, Download, Upload, Sparkles, Database, Shield } from 'lucide-react'

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

const aiModels = [
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', tier: 'pro' },
  { value: 'gpt-4o', label: 'GPT-4o', tier: 'pro' },
  { value: 'deepseek-v3', label: 'DeepSeek V3', tier: 'free' },
  { value: 'qwen-max', label: 'Qwen Max', tier: 'free' },
]

export default function SettingsPage() {
  const params = useParams()
  const novelId = params.novelId as string

  const [settings, setSettings] = useState({
    // Basic info
    title: '斗破苍穹：新篇',
    description: '一个少年从废柴逆袭成为斗帝的故事...',
    genre: 'fantasy',
    targetWordCount: 200000,

    // AI settings
    aiModel: 'deepseek-v3',
    writingStyle: 'plot',
    enableAutoArchive: false,
    enableGraphRag: false,
    enableDirectorMode: true,

    // Privacy
    enablePrivacyMode: false,
    autoBackup: true,
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: API call to save settings
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="作品设置" />

      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="ai">AI 设置</TabsTrigger>
              <TabsTrigger value="privacy">隐私与备份</TabsTrigger>
              <TabsTrigger value="danger">危险操作</TabsTrigger>
            </TabsList>

            {/* Basic Info */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                  <CardDescription>修改作品的基本信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">作品名称</Label>
                    <Input
                      id="title"
                      value={settings.title}
                      onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">作品简介</Label>
                    <Textarea
                      id="description"
                      value={settings.description}
                      onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="genre">作品类型</Label>
                      <Select
                        value={settings.genre}
                        onValueChange={(value) => setSettings({ ...settings, genre: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
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

                    <div className="space-y-2">
                      <Label htmlFor="targetWordCount">目标字数</Label>
                      <Input
                        id="targetWordCount"
                        type="number"
                        value={settings.targetWordCount}
                        onChange={(e) =>
                          setSettings({ ...settings, targetWordCount: parseInt(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Settings */}
            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI 模型设置
                  </CardTitle>
                  <CardDescription>配置 AI 写作助手的行为</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>AI 模型</Label>
                    <Select
                      value={settings.aiModel}
                      onValueChange={(value) => setSettings({ ...settings, aiModel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aiModels.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            <div className="flex items-center gap-2">
                              <span>{model.label}</span>
                              {model.tier === 'pro' && (
                                <Badge variant="secondary" className="text-xs">
                                  Pro
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Pro 模型需要升级会员才能使用
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>默认写作模式</Label>
                    <Select
                      value={settings.writingStyle}
                      onValueChange={(value) => setSettings({ ...settings, writingStyle: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plot">剧情推进 - 注重动作、对话</SelectItem>
                        <SelectItem value="atmosphere">氛围渲染 - 注重景物、心理</SelectItem>
                        <SelectItem value="comedy">轻松幽默 - 适合轻小说</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    高级功能
                  </CardTitle>
                  <CardDescription>启用高级 AI 功能（部分功能需要 Pro 会员）</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>导演模式</Label>
                      <p className="text-xs text-muted-foreground">
                        AI 先生成多个剧情走向供你选择
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableDirectorMode}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, enableDirectorMode: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label>自动逆向归档</Label>
                        <Badge variant="secondary" className="text-xs">Pro</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        每章保存后自动提取新设定更新知识库
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableAutoArchive}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, enableAutoArchive: checked })
                      }
                      disabled
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label>GraphRAG 推理</Label>
                        <Badge variant="secondary" className="text-xs">Pro</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        基于知识图谱推理人物关系和行为逻辑
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableGraphRag}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, enableGraphRag: checked })
                      }
                      disabled
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    隐私设置
                  </CardTitle>
                  <CardDescription>管理数据隐私和备份</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>隐私模式</Label>
                      <p className="text-xs text-muted-foreground">
                        开启后，你的内容不会用于训练公共模型
                      </p>
                    </div>
                    <Switch
                      checked={settings.enablePrivacyMode}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, enablePrivacyMode: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>自动备份</Label>
                      <p className="text-xs text-muted-foreground">
                        每日自动备份到云端
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoBackup}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, autoBackup: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>导出与导入</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      导出为 DOCX
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      导出为 PDF
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      导出为 EPUB
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    导入设定数据
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Danger Zone */}
            <TabsContent value="danger" className="space-y-6">
              <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                  <CardTitle className="text-red-600">危险操作</CardTitle>
                  <CardDescription>以下操作不可逆，请谨慎操作</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除作品
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确定删除作品？</AlertDialogTitle>
                        <AlertDialogDescription>
                          此操作将永久删除作品「{settings.title}」及其所有章节、设定数据。
                          该操作不可撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          确认删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full text-red-600 border-red-200">
                        <Database className="h-4 w-4 mr-2" />
                        清空设定数据
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确定清空设定数据？</AlertDialogTitle>
                        <AlertDialogDescription>
                          此操作将删除所有人物、地点、物品和设定条目，但保留章节内容。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          确认清空
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? '保存中...' : '保存设置'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
