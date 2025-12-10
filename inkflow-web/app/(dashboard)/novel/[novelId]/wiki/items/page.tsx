'use client'

import { useParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Sword, Sparkles, FlaskConical, MoreHorizontal, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useItems, useCharacters } from '@/lib/hooks/useNovels'
import { useMemo, useState } from 'react'
import type { Item } from '@/lib/types/database'

const categoryConfig: Record<string, { icon: typeof Sword; label: string; color: string }> = {
  weapon: { icon: Sword, label: '武器', color: 'text-red-500' },
  skill: { icon: Sparkles, label: '功法/技能', color: 'text-purple-500' },
  artifact: { icon: FlaskConical, label: '法宝/道具', color: 'text-amber-500' },
}

export default function ItemsPage() {
  const params = useParams()
  const novelId = params.novelId as string
  const [searchQuery, setSearchQuery] = useState('')

  const { data: items = [], isLoading, error } = useItems(novelId)
  const { data: characters = [] } = useCharacters(novelId)

  // Create character lookup map
  const characterMap = useMemo(() => {
    const map = new Map<string, string>()
    characters.forEach(c => map.set(c.id, c.name))
    return map
  }, [characters])

  // Group items by category
  const groupedItems = useMemo(() => {
    const weapons = items.filter(i => i.category === 'weapon')
    const skills = items.filter(i => i.category === 'skill')
    const artifacts = items.filter(i => i.category === 'artifact')
    return { weapons, skills, artifacts, all: items }
  }, [items])

  // Filter items
  const filterItems = (itemList: Item[]) => {
    if (!searchQuery.trim()) return itemList
    const query = searchQuery.toLowerCase()
    return itemList.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="物品/功法管理" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <Header title="物品/功法管理" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-destructive">加载失败：{error.message}</p>
        </div>
      </div>
    )
  }

  const ItemCard = ({ item }: { item: Item }) => {
    const config = categoryConfig[item.category] || categoryConfig.artifact
    const Icon = config.icon
    const attributes = item.attributes as Record<string, string> | null
    const ownerName = item.owner_id ? characterMap.get(item.owner_id) : null

    return (
      <Card className="group hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${config.color}`} />
                <h3 className="font-semibold">{item.name}</h3>
                {attributes?.grade && (
                  <Badge variant="secondary" className="text-xs">
                    {attributes.grade}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
              {ownerName && (
                <p className="text-xs text-muted-foreground">
                  持有者: <span className="font-medium">{ownerName}</span>
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
            <Input
              placeholder="搜索物品或功法..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            添加条目
          </Button>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-12">
            <Sword className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无物品</h3>
            <p className="text-muted-foreground mb-4">
              点击上方按钮添加你的第一个物品或功法
            </p>
          </div>
        )}

        {/* Tabs */}
        {items.length > 0 && (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">全部 ({items.length})</TabsTrigger>
              <TabsTrigger value="weapons">
                <Sword className="h-4 w-4 mr-1" />
                武器 ({groupedItems.weapons.length})
              </TabsTrigger>
              <TabsTrigger value="skills">
                <Sparkles className="h-4 w-4 mr-1" />
                功法 ({groupedItems.skills.length})
              </TabsTrigger>
              <TabsTrigger value="artifacts">
                <FlaskConical className="h-4 w-4 mr-1" />
                法宝 ({groupedItems.artifacts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {filterItems(groupedItems.all).map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="weapons" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {filterItems(groupedItems.weapons).map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="skills" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {filterItems(groupedItems.skills).map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="artifacts" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {filterItems(groupedItems.artifacts).map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
