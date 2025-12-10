import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types/database'

interface AuthState {
  // 状态
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  // 认证操作
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>

  // OAuth 登录
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>

  // 会话管理
  initialize: () => Promise<void>
  refreshSession: () => Promise<void>

  // Profile 操作
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>

  // 辅助方法
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      // 初始化 - 检查现有会话
      initialize: async () => {
        const supabase = createClient()

        try {
          set({ isLoading: true, error: null })

          // 获取当前会话
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()

          if (sessionError) {
            throw sessionError
          }

          if (session?.user) {
            // 获取用户 profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            set({
              user: session.user,
              session,
              profile,
              isInitialized: true,
              isLoading: false,
            })
          } else {
            set({
              user: null,
              session: null,
              profile: null,
              isInitialized: true,
              isLoading: false,
            })
          }

          // 监听认证状态变化
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

              set({
                user: session.user,
                session,
                profile,
              })
            } else if (event === 'SIGNED_OUT') {
              set({
                user: null,
                session: null,
                profile: null,
              })
            } else if (event === 'TOKEN_REFRESHED' && session) {
              set({ session })
            }
          })
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({
            error: error instanceof Error ? error.message : '认证初始化失败',
            isInitialized: true,
            isLoading: false,
          })
        }
      },

      // 邮箱密码登录
      signIn: async (email: string, password: string) => {
        const supabase = createClient()

        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            set({ isLoading: false, error: error.message })
            return { success: false, error: error.message }
          }

          if (data.user) {
            // 获取用户 profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()

            set({
              user: data.user,
              session: data.session,
              profile,
              isLoading: false,
            })
          }

          return { success: true }
        } catch (error) {
          const message = error instanceof Error ? error.message : '登录失败'
          set({ isLoading: false, error: message })
          return { success: false, error: message }
        }
      },

      // 邮箱密码注册
      signUp: async (email: string, password: string, name?: string) => {
        const supabase = createClient()

        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name || email.split('@')[0],
              },
            },
          })

          if (error) {
            set({ isLoading: false, error: error.message })
            return { success: false, error: error.message }
          }

          if (data.user) {
            // 如果启用了邮箱确认，用户可能没有 session
            if (data.session) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single()

              set({
                user: data.user,
                session: data.session,
                profile,
                isLoading: false,
              })
            } else {
              set({ isLoading: false })
            }
          }

          return { success: true }
        } catch (error) {
          const message = error instanceof Error ? error.message : '注册失败'
          set({ isLoading: false, error: message })
          return { success: false, error: message }
        }
      },

      // 登出
      signOut: async () => {
        const supabase = createClient()

        try {
          set({ isLoading: true, error: null })

          const { error } = await supabase.auth.signOut()

          if (error) {
            throw error
          }

          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
          })
        } catch (error) {
          console.error('Sign out error:', error)
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '登出失败',
          })
        }
      },

      // OAuth 登录
      signInWithOAuth: async (provider: 'google' | 'github') => {
        const supabase = createClient()

        try {
          set({ isLoading: true, error: null })

          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) {
            throw error
          }

          // OAuth 会重定向，所以不需要在这里设置状态
        } catch (error) {
          console.error('OAuth error:', error)
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'OAuth 登录失败',
          })
        }
      },

      // 刷新会话
      refreshSession: async () => {
        const supabase = createClient()

        try {
          const { data, error } = await supabase.auth.refreshSession()

          if (error) {
            throw error
          }

          if (data.session) {
            set({ session: data.session })
          }
        } catch (error) {
          console.error('Refresh session error:', error)
        }
      },

      // 更新 Profile
      updateProfile: async (updates: Partial<Profile>) => {
        const supabase = createClient()
        const { user } = get()

        if (!user) {
          return { success: false, error: '未登录' }
        }

        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase
            .from('profiles')
            .update(updates as never)
            .eq('id', user.id)
            .select()
            .single()

          if (error) {
            throw error
          }

          set({
            profile: data,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          const message = error instanceof Error ? error.message : '更新失败'
          set({ isLoading: false, error: message })
          return { success: false, error: message }
        }
      },

      // 清除错误
      clearError: () => {
        set({ error: null })
      },
    }),
    { name: 'auth-store' }
  )
)
