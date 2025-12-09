// Re-export all types
export * from './novel'
export * from './character'
export * from './wiki'
export * from './ai'

// Common types
export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  subscriptionTier: SubscriptionTier
  createdAt: Date
  updatedAt: Date
}

export type SubscriptionTier = 'free' | 'pro' | 'enterprise'

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
