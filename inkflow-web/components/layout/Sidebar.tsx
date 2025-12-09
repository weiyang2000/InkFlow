'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  BookOpen,
  FileText,
  Users,
  MapPin,
  Sword,
  Network,
  Settings,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react'
import { useUIStore } from '@/lib/store'

interface SidebarProps {
  novelId?: string
}

export function Sidebar({ novelId }: SidebarProps) {
  const pathname = usePathname()
  const { isSidebarOpen, toggleSidebar } = useUIStore()

  const novelNavItems = novelId
    ? [
        {
          title: '概览',
          href: `/novel/${novelId}`,
          icon: BookOpen,
        },
        {
          title: '编辑器',
          href: `/novel/${novelId}/editor`,
          icon: FileText,
        },
        {
          title: '大纲',
          href: `/novel/${novelId}/outline`,
          icon: Network,
        },
        {
          title: '人物',
          href: `/novel/${novelId}/wiki/characters`,
          icon: Users,
        },
        {
          title: '地点',
          href: `/novel/${novelId}/wiki/locations`,
          icon: MapPin,
        },
        {
          title: '物品',
          href: `/novel/${novelId}/wiki/items`,
          icon: Sword,
        },
        {
          title: '关系图谱',
          href: `/novel/${novelId}/graph`,
          icon: Network,
        },
        {
          title: '设置',
          href: `/novel/${novelId}/settings`,
          icon: Settings,
        },
      ]
    : []

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-background transition-all duration-300',
        isSidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        {isSidebarOpen && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-semibold">InkFlow</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(!isSidebarOpen && 'mx-auto')}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        {novelId && (
          <>
            <nav className="flex flex-col gap-1">
              {novelNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start',
                        !isSidebarOpen && 'justify-center px-2'
                      )}
                    >
                      <item.icon className={cn('h-5 w-5', isSidebarOpen && 'mr-3')} />
                      {isSidebarOpen && <span>{item.title}</span>}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        {isSidebarOpen ? (
          <div className="text-xs text-muted-foreground">
            <p>InkFlow v0.1.0</p>
            <p>AI辅助小说创作平台</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </aside>
  )
}
