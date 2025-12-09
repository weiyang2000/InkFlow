'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
  Sparkles
} from 'lucide-react'
import { useUIStore } from '@/lib/store'

interface HeaderProps {
  title?: string
  showSearch?: boolean
}

export function Header({ title, showSearch = true }: HeaderProps) {
  const { theme, setTheme, openSearch } = useUIStore()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-lg font-semibold">{title}</h1>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Search */}
        {showSearch && (
          <Button
            variant="outline"
            size="sm"
            className="w-64 justify-start text-muted-foreground"
            onClick={openSearch}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>搜索设定... ⌘K</span>
          </Button>
        )}

        {/* AI Credits indicator */}
        <Button variant="ghost" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <span className="text-sm">1,000</span>
        </Button>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/user.png" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">用户名</p>
                <p className="text-xs leading-none text-muted-foreground">
                  user@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>个人资料</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>设置</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
