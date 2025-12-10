'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Novel, NovelInsert, NovelUpdate, Chapter, Character, Location, Item, CharacterRelationship } from '@/lib/types/database'

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

// Fetch all novels for current user
export function useNovels() {
  return useQuery({
    queryKey: ['novels'],
    queryFn: async (): Promise<Novel[]> => {
      const res = await fetch('/api/novels')
      if (!res.ok) {
        throw new Error('Failed to fetch novels')
      }
      const json: ApiResponse<Novel[]> = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch novels')
      }
      return json.data
    },
  })
}

// Fetch single novel
export function useNovel(novelId: string) {
  return useQuery({
    queryKey: ['novels', novelId],
    queryFn: async (): Promise<Novel> => {
      const res = await fetch(`/api/novels/${novelId}`)
      if (!res.ok) {
        throw new Error('Failed to fetch novel')
      }
      const json: ApiResponse<Novel> = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch novel')
      }
      return json.data
    },
    enabled: !!novelId,
  })
}

// Create novel mutation
export function useCreateNovel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<NovelInsert, 'user_id'>): Promise<Novel> => {
      const res = await fetch('/api/novels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to create novel')
      }
      const json: ApiResponse<Novel> = await res.json()
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novels'] })
    },
  })
}

// Update novel mutation
export function useUpdateNovel(novelId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: NovelUpdate): Promise<Novel> => {
      const res = await fetch(`/api/novels/${novelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to update novel')
      }
      const json: ApiResponse<Novel> = await res.json()
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novels'] })
      queryClient.invalidateQueries({ queryKey: ['novels', novelId] })
    },
  })
}

// Delete novel mutation
export function useDeleteNovel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (novelId: string): Promise<void> => {
      const res = await fetch(`/api/novels/${novelId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to delete novel')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novels'] })
    },
  })
}

// Fetch chapters for a novel
export function useChapters(novelId: string) {
  return useQuery({
    queryKey: ['novels', novelId, 'chapters'],
    queryFn: async (): Promise<Chapter[]> => {
      const res = await fetch(`/api/novels/${novelId}/chapters`)
      if (!res.ok) {
        throw new Error('Failed to fetch chapters')
      }
      const json: ApiResponse<Chapter[]> = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch chapters')
      }
      return json.data
    },
    enabled: !!novelId,
  })
}

// Fetch single chapter
export function useChapter(novelId: string, chapterId: string) {
  return useQuery({
    queryKey: ['novels', novelId, 'chapters', chapterId],
    queryFn: async (): Promise<Chapter> => {
      const res = await fetch(`/api/novels/${novelId}/chapters/${chapterId}`)
      if (!res.ok) {
        throw new Error('Failed to fetch chapter')
      }
      const json: ApiResponse<Chapter> = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch chapter')
      }
      return json.data
    },
    enabled: !!novelId && !!chapterId,
  })
}

// Fetch characters for a novel
export function useCharacters(novelId: string) {
  return useQuery({
    queryKey: ['novels', novelId, 'characters'],
    queryFn: async (): Promise<Character[]> => {
      const res = await fetch(`/api/novels/${novelId}/characters`)
      if (!res.ok) {
        throw new Error('Failed to fetch characters')
      }
      const json: ApiResponse<Character[]> = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch characters')
      }
      return json.data
    },
    enabled: !!novelId,
  })
}

// Fetch locations for a novel
export function useLocations(novelId: string) {
  return useQuery({
    queryKey: ['novels', novelId, 'locations'],
    queryFn: async (): Promise<Location[]> => {
      const res = await fetch(`/api/novels/${novelId}/locations`)
      if (!res.ok) {
        throw new Error('Failed to fetch locations')
      }
      const json: ApiResponse<Location[]> = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch locations')
      }
      return json.data
    },
    enabled: !!novelId,
  })
}

// Fetch items for a novel
export function useItems(novelId: string) {
  return useQuery({
    queryKey: ['novels', novelId, 'items'],
    queryFn: async (): Promise<Item[]> => {
      const res = await fetch(`/api/novels/${novelId}/items`)
      if (!res.ok) {
        throw new Error('Failed to fetch items')
      }
      const json: ApiResponse<Item[]> = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch items')
      }
      return json.data
    },
    enabled: !!novelId,
  })
}

// Fetch character relationships for a novel
export function useCharacterRelationships(novelId: string) {
  return useQuery({
    queryKey: ['novels', novelId, 'relationships'],
    queryFn: async (): Promise<CharacterRelationship[]> => {
      const res = await fetch(`/api/novels/${novelId}/relationships`)
      if (!res.ok) {
        throw new Error('Failed to fetch relationships')
      }
      const json: ApiResponse<CharacterRelationship[]> = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch relationships')
      }
      return json.data
    },
    enabled: !!novelId,
  })
}

// Create chapter mutation
export function useCreateChapter(novelId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      title: string
      content?: string
      status?: string
      summary?: string
      outline_data?: Record<string, unknown>
    }): Promise<Chapter> => {
      const res = await fetch(`/api/novels/${novelId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to create chapter')
      }
      const json: ApiResponse<Chapter> = await res.json()
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novels', novelId, 'chapters'] })
      queryClient.invalidateQueries({ queryKey: ['novels', novelId] })
    },
  })
}

// Update chapter mutation
export function useUpdateChapter(novelId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ chapterId, data }: { chapterId: string; data: Partial<Chapter> }): Promise<Chapter> => {
      const res = await fetch(`/api/novels/${novelId}/chapters/${chapterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to update chapter')
      }
      const json: ApiResponse<Chapter> = await res.json()
      return json.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['novels', novelId, 'chapters'] })
      queryClient.invalidateQueries({ queryKey: ['novels', novelId, 'chapters', variables.chapterId] })
      queryClient.invalidateQueries({ queryKey: ['novels', novelId] })
    },
  })
}

// Delete chapter mutation
export function useDeleteChapter(novelId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (chapterId: string): Promise<void> => {
      const res = await fetch(`/api/novels/${novelId}/chapters/${chapterId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to delete chapter')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novels', novelId, 'chapters'] })
      queryClient.invalidateQueries({ queryKey: ['novels', novelId] })
    },
  })
}

// Types for extracted settings
interface ExtractedCharacter {
  name: string
  aliases?: string[]
  description?: string | null
  personality?: string | null
  background?: string | null
  is_protagonist?: boolean
}

interface ExtractedLocation {
  name: string
  description?: string | null
  environment_keywords?: string[]
}

interface ExtractedItem {
  name: string
  category: string
  description?: string | null
}

export interface ExtractedSettings {
  characters: ExtractedCharacter[]
  locations: ExtractedLocation[]
  items: ExtractedItem[]
}

export interface BatchSettingsResult {
  charactersCreated: number
  locationsCreated: number
  itemsCreated: number
  warnings: string[]
}

// Extract settings from outline using AI
export function useExtractSettings() {
  return useMutation({
    mutationFn: async (params: {
      title: string
      description?: string
      genre?: string
      chapters: { title: string; summary?: string }[]
    }): Promise<ExtractedSettings> => {
      const res = await fetch('/api/ai/extract-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to extract settings')
      }
      const json: ApiResponse<ExtractedSettings> = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Failed to extract settings')
      }
      return json.data
    },
  })
}

// Batch create settings for a novel
export function useBatchCreateSettings(novelId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: ExtractedSettings): Promise<BatchSettingsResult> => {
      const res = await fetch(`/api/novels/${novelId}/batch-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to create settings')
      }
      const json = await res.json()
      return json.summary
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['novels', novelId, 'characters'] })
      queryClient.invalidateQueries({ queryKey: ['novels', novelId, 'locations'] })
      queryClient.invalidateQueries({ queryKey: ['novels', novelId, 'items'] })
    },
  })
}
