import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database'

/**
 * 创建服务端 Supabase 客户端
 * 用于 Server Components、Route Handlers、Server Actions
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 在 Server Component 中调用时可能会失败
            // 如果有中间件刷新用户会话，可以忽略此错误
          }
        },
      },
    }
  )
}

/**
 * 获取当前登录用户
 * 返回 null 表示未登录
 */
export async function getServerUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * 获取当前用户的 profile 信息
 */
export async function getServerProfile() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return null
  }

  return profile
}
