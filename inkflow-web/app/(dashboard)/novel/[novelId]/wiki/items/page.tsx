'use client'

import { useParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Sword, Sparkles, FlaskConical, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Item type for all categories
interface MockItem {
  id: string
  name: string
  category: string
  description: string
  owner: string | null
  attributes: Record<string, string>
}

// Mock data
const mockItems: { weapons: MockItem[]; skills: MockItem[]; artifacts: MockItem[] } = {
  weapons: [
    {
      id: '1',
      name: '龙渊剑',
      category: 'weapon',
      description: '远古圣剑，只有皇室血统才能拔出，拔出时有龙吟声',
      owner: '萧炎',
      attributes: { grade: '天阶高级', effect: '龙吟震慑' },
    },
    {
      id: '2',
      name: '玄重尺',
      category: 'weapon',
      description: '重达千斤的黑色巨尺',
      owner: '萧炎',
      attributes: { grade: '地阶顶级', effect: '重压' },
    },
  ],
  skills: [
    {
      id: '3',
      name: '佛怒火莲',
      category: 'skill',
      description: '融合多种异火形成的终极杀招',
      owner: '萧炎',
      attributes: { grade: '自创', requirement: '需要两种以上异火' },
    },
    {
      id: '4',
      name: '三千雷动',
      category: 'skill',
      description: '风雷阁镇派身法',
      owner: null,
      attributes: { grade: '天阶高级', effect: '极速移动' },
    },
  ],
  artifacts: [
    {
      id: '5',
      name: '纳戒',
      category: 'artifact',
      description: '药老灵魂所在的戒指，内有空间',
      owner: '萧炎',
      attributes: { grade: '未知', effect: '储物空间' },
    },
  ],
}

const categoryConfig = {
  weapon: { icon: Sword, label: '武器', color: 'text-red-500' },
  skill: { icon: Sparkles, label: '功法/技能', color: 'text-purple-500' },
  artifact: { icon: FlaskConical, label: '法宝/道具', color: 'text-amber-500' },
}

export default function ItemsPage() {
  const params = useParams()
  const novelId = params.novelId as string

  const ItemCard = ({ item }: { item: MockItem }) => {
    const config = categoryConfig[item.category as keyof typeof categoryConfig]
    const Icon = config.icon

    return (
      <Card className="group hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${config.color}`} />
                <h3 className="font-semibold">{item.name}</h3>
                {item.attributes.grade && (
                  <Badge variant="secondary" className="text-xs">
                    {item.attributes.grade}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
              {item.owner && (
                <p className="text-xs text-muted-foreground">
                  持有者: <span className="font-medium">{item.owner}</span>
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>编辑</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">删除</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="物品/功法管理" />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索物品或功法..." className="pl-10" />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            添加条目
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="weapons">
              <Sword className="h-4 w-4 mr-1" />
              武器 ({mockItems.weapons.length})
            </TabsTrigger>
            <TabsTrigger value="skills">
              <Sparkles className="h-4 w-4 mr-1" />
              功法 ({mockItems.skills.length})
            </TabsTrigger>
            <TabsTrigger value="artifacts">
              <FlaskConical className="h-4 w-4 mr-1" />
              法宝 ({mockItems.artifacts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {[...mockItems.weapons, ...mockItems.skills, ...mockItems.artifacts].map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weapons" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {mockItems.weapons.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {mockItems.skills.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="artifacts" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {mockItems.artifacts.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
