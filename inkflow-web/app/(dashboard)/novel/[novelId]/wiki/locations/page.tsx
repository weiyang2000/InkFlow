'use client'

import { useParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, MapPin, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Mock data
const mockLocations = [
  {
    id: '1',
    name: '乌坦城',
    description: '萧家所在的城市，帝国边境大城',
    environmentKeywords: ['繁华', '城墙', '商队'],
    children: [
      { id: '1-1', name: '萧家大院', description: '萧家祖宅' },
      { id: '1-2', name: '纳兰家', description: '纳兰家族在城中的府邸' },
    ],
  },
  {
    id: '2',
    name: '云岚宗',
    description: '加玛帝国第一大宗门',
    environmentKeywords: ['云雾', '悬崖', '宗门大殿'],
    children: [],
  },
  {
    id: '3',
    name: '魔兽山脉',
    description: '充满危险魔兽的广袤山脉',
    environmentKeywords: ['原始森林', '魔兽', '危险'],
    children: [
      { id: '3-1', name: '蛇女族领地', description: '蛇人族聚居地' },
    ],
  },
]

export default function LocationsPage() {
  const params = useParams()
  const novelId = params.novelId as string

  return (
    <div className="flex flex-col h-full">
      <Header title="地点管理" />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索地点..." className="pl-10" />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            添加地点
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>共 {mockLocations.length} 个主要地点</span>
          </div>
        </div>

        {/* Location list */}
        <div className="space-y-4">
          {mockLocations.map((location) => (
            <Card key={location.id} className="group">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-amber-500" />
                      <h3 className="font-semibold">{location.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {location.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {location.environmentKeywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
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
                      <DropdownMenuItem>添加子地点</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">删除</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Child locations */}
                {location.children.length > 0 && (
                  <div className="mt-4 ml-6 pl-4 border-l-2 space-y-2">
                    {location.children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{child.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {child.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
