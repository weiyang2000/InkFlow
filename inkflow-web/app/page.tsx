import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  BookOpen,
  Sparkles,
  Network,
  Wand2,
  FileText,
  Users,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI 智能续写',
      description: '基于 RAG 技术的上下文感知续写，保持人物性格和剧情一致性',
    },
    {
      icon: Network,
      title: '知识图谱',
      description: 'GraphRAG 技术构建人物关系网络，AI 自动推理人物行为逻辑',
    },
    {
      icon: Wand2,
      title: '导演模式',
      description: '策划-执行-反思的三步工作流，让 AI 写出你想要的剧情',
    },
    {
      icon: FileText,
      title: '世界观百科',
      description: '动态管理人物、地点、物品设定，AI 写作时自动检索参考',
    },
    {
      icon: Users,
      title: '自动归档',
      description: '每章写完自动提取新设定，更新知识库，杜绝"吃书"',
    },
    {
      icon: BookOpen,
      title: '大纲规划',
      description: '可视化脑图编辑，节奏热力图分析，把控故事结构',
    },
  ]

  const benefits = [
    '解决长篇小说"设定遗忘"问题',
    '保持人物性格和行为一致性',
    '智能推理人物关系和剧情逻辑',
    '多种写作模式适应不同场景',
    '自动更新世界观设定库',
    '流式生成，即时反馈',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">InkFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">登录</Button>
            </Link>
            <Link href="/register">
              <Button>免费试用</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            AI 驱动的
            <span className="text-primary"> 长篇小说 </span>
            创作平台
          </h1>
          <p className="text-xl text-muted-foreground">
            基于 GraphRAG 技术，解决长篇小说"设定遗忘"和"人物崩坏"问题。
            <br />
            让 AI 成为你的写作副驾驶，从灵感到完稿的全流程辅助。
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                开始创作
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              观看演示
            </Button>
          </div>
        </div>

        {/* Preview image placeholder */}
        <div className="mt-16 rounded-xl border bg-muted/50 aspect-video max-w-5xl mx-auto flex items-center justify-center">
          <div className="text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>产品截图预览</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">核心功能</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            InkFlow 不仅是一个写作工具，更是一个理解你故事世界的 AI 伙伴
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                为什么选择 InkFlow？
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border bg-background p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  AI 正在续写...
                </div>
                <p className="text-lg leading-relaxed">
                  风像是被撕裂的帛，尖啸着灌入耳膜。林默握紧了手中的龙渊剑，
                  剑身上隐隐传来的龙吟声让他心神一定。
                </p>
                <p className="text-lg leading-relaxed">
                  赵无极站在十步之外，脸色苍白如纸。他的目光不时扫向角落——
                  那里，一只野猫正懒洋洋地舔着爪子。
                </p>
                <p className="text-sm text-muted-foreground italic">
                  * AI 根据"赵无极怕猫"的设定自动推理并融入剧情
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">准备好开始创作了吗？</h2>
          <p className="text-muted-foreground text-lg">
            免费注册，体验 AI 辅助写作的魅力
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              立即开始
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 InkFlow. AI 辅助小说创作平台</p>
        </div>
      </footer>
    </div>
  )
}
