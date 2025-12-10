'use client'

import { useParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, MapPin, MoreHorizontal, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLocations } from '@/lib/hooks/useNovels'
import { useMemo, useState } from 'react'
import type { Location } from '@/lib/types/database'

// Build tree structure from flat locations
interface LocationNode extends Location {
  children: LocationNode[]
}

function buildLocationTree(locations: Location[]): LocationNode[] {
  const map = new Map<string, LocationNode>()
  const roots: LocationNode[] = []

  // First pass: create nodes
  locations.forEach(loc => {
    map.set(loc.id, { ...loc, children: [] })
  })

  // Second pass: build tree
  locations.forEach(loc => {
    const node = map.get(loc.id)!
    if (loc.parent_id && map.has(loc.parent_id)) {
      map.get(loc.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

export default function LocationsPage() {
  const params = useParams()
  const novelId = params.novelId as string
  const [searchQuery, setSearchQuery] = useState('')

  const { data: locations = [], isLoading, error } = useLocations(novelId)

  const locationTree = useMemo(() => buildLocationTree(locations), [locations])

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locationTree
    const query = searchQuery.toLowerCase()
    return locationTree.filter(loc =>
      loc.name.toLowerCase().includes(query) ||
      loc.description?.toLowerCase().includes(query)
    )
  }, [locationTree, searchQuery])

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="地点管理" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <Header title="地点管理" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-destructive">加载失败：{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="地点管理" />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索地点..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
            <span>共 {locations.length} 个地点</span>
          </div>
        </div>

        {/* Empty state */}
        {locations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无地点</h3>
            <p className="text-muted-foreground mb-4">
              点击上方按钮添加你的第一个地点
            </p>
          </div>
        )}

        {/* Location list */}
        <div className="space-y-4">
          {filteredLocations.map((location) => (
            <Card key={location.id} className="group">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-amber-500" />
                      <h3 className="font-semibold">{location.name}</h3>
                    </div>
                    {location.description && (
                      <p className="text-sm text-muted-foreground">
                        {location.description}
                      </p>
                    )}
                    {location.environment_keywords && location.environment_keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {location.environment_keywords.map((keyword) => (
                          <Badge key={keyword} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
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
                          {child.description && (
                            <span className="text-xs text-muted-foreground">
                              {child.description}
                            </span>
                          )}
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
