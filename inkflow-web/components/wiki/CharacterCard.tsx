'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Plus, Search, MoreHorizontal, Star, Users } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Character } from '@/lib/types'

interface CharacterCardProps {
  character: Character
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function CharacterCard({ character, onClick, onEdit, onDelete }: CharacterCardProps) {
  return (
    <Card
      className="group hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={character.avatarUrl} />
            <AvatarFallback className="text-lg">
              {character.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{character.name}</h3>
                {character.isProtagonist && (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.() }}>
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onDelete?.() }}
                    className="text-red-600"
                  >
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {character.aliases.length > 0 && (
              <p className="text-sm text-muted-foreground">
                又名: {character.aliases.join('、')}
              </p>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {character.description || '暂无描述'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface CharacterFormProps {
  character?: Partial<Character>
  onSubmit: (data: Partial<Character>) => void
  onCancel: () => void
}

export function CharacterForm({ character, onSubmit, onCancel }: CharacterFormProps) {
  const [formData, setFormData] = useState({
    name: character?.name || '',
    aliases: character?.aliases?.join('、') || '',
    description: character?.description || '',
    personality: character?.personality || '',
    background: character?.background || '',
    isProtagonist: character?.isProtagonist || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      aliases: formData.aliases.split('、').filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">姓名 *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="人物姓名"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="aliases">别名（用顿号分隔）</Label>
          <Input
            id="aliases"
            value={formData.aliases}
            onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
            placeholder="如：炎帝、萧战"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">简要描述</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="一句话描述人物..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="personality">性格特点</Label>
        <Textarea
          id="personality"
          value={formData.personality}
          onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
          placeholder="描述人物性格..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="background">背景故事</Label>
        <Textarea
          id="background"
          value={formData.background}
          onChange={(e) => setFormData({ ...formData, background: e.target.value })}
          placeholder="人物的背景故事..."
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="protagonist"
          checked={formData.isProtagonist}
          onCheckedChange={(checked) => setFormData({ ...formData, isProtagonist: checked })}
        />
        <Label htmlFor="protagonist">主角</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={!formData.name}>
          保存
        </Button>
      </DialogFooter>
    </form>
  )
}

interface CharacterListProps {
  characters: Character[]
  onSelect?: (character: Character) => void
  onAdd?: () => void
  onEdit?: (character: Character) => void
  onDelete?: (character: Character) => void
}

export function CharacterList({
  characters,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: CharacterListProps) {
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const filteredCharacters = characters.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.aliases.some((a) => a.toLowerCase().includes(search.toLowerCase()))
  )

  const protagonists = filteredCharacters.filter((c) => c.isProtagonist)
  const others = filteredCharacters.filter((c) => !c.isProtagonist)

  const handleCreate = (data: Partial<Character>) => {
    // TODO: API call to create character
    console.log('Create character:', data)
    setIsCreateOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索人物..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              添加人物
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>添加新人物</DialogTitle>
              <DialogDescription>
                创建新的人物角色，AI 将在写作时参考这些设定。
              </DialogDescription>
            </DialogHeader>
            <CharacterForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>共 {characters.length} 个人物</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span>{protagonists.length} 个主角</span>
        </div>
      </div>

      {/* Protagonist section */}
      {protagonists.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">主角</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {protagonists.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onClick={() => onSelect?.(character)}
                onEdit={() => onEdit?.(character)}
                onDelete={() => onDelete?.(character)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other characters */}
      {others.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">其他人物</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {others.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onClick={() => onSelect?.(character)}
                onEdit={() => onEdit?.(character)}
                onDelete={() => onDelete?.(character)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredCharacters.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">暂无人物</h3>
          <p className="text-muted-foreground">
            {search ? '没有找到匹配的人物' : '点击上方按钮添加第一个人物'}
          </p>
        </div>
      )}
    </div>
  )
}
