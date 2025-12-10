import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

// 需要登录才能访问的路由
const protectedRoutes = [
  '/dashboard',
  '/editor',
  '/wiki',
  '/settings',
]

// 已登录用户不应访问的路由
const authRoutes = [
  '/login',
  '/register',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 创建 Supabase 客户端并获取用户
  const { user, response } = await createMiddlewareClient(request)

  // 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // 检查是否是认证路由
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  )

  // 未登录用户访问受保护路由 -> 重定向到登录页
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 已登录用户访问认证路由 -> 重定向到 dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * 匹配所有路由除了:
     * - api (API 路由)
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - public 文件夹
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}
