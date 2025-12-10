import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/types/database'

/**
 * 创建中间件用 Supabase 客户端
 * 用于刷新用户会话和路由保护
 */
export async function createMiddlewareClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 重要：不要在 createServerClient 和 supabase.auth.getUser() 之间写任何逻辑
  // 否则可能导致用户意外登出

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabase, user, response: supabaseResponse }
}
