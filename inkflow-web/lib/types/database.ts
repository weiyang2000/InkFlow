/**
 * Supabase 数据库类型定义
 * 基于 Prisma Schema 手动维护
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
      }
      novels: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          genre: string | null
          cover_url: string | null
          word_count: number
          status: 'draft' | 'publishing' | 'completed' | 'archived'
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          genre?: string | null
          cover_url?: string | null
          word_count?: number
          status?: 'draft' | 'publishing' | 'completed' | 'archived'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          genre?: string | null
          cover_url?: string | null
          word_count?: number
          status?: 'draft' | 'publishing' | 'completed' | 'archived'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      volumes: {
        Row: {
          id: string
          novel_id: string
          title: string
          description: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          novel_id: string
          title: string
          description?: string | null
          sort_order: number
          created_at?: string
        }
        Update: {
          id?: string
          novel_id?: string
          title?: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      chapters: {
        Row: {
          id: string
          novel_id: string
          volume_id: string | null
          title: string
          content: string
          summary: string | null
          word_count: number
          sort_order: number
          status: string
          outline_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          novel_id: string
          volume_id?: string | null
          title: string
          content?: string
          summary?: string | null
          word_count?: number
          sort_order: number
          status?: string
          outline_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          novel_id?: string
          volume_id?: string | null
          title?: string
          content?: string
          summary?: string | null
          word_count?: number
          sort_order?: number
          status?: string
          outline_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      characters: {
        Row: {
          id: string
          novel_id: string
          name: string
          aliases: string[]
          avatar_url: string | null
          description: string | null
          personality: string | null
          background: string | null
          attributes: Json
          first_appearance_chapter_id: string | null
          is_protagonist: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          novel_id: string
          name: string
          aliases?: string[]
          avatar_url?: string | null
          description?: string | null
          personality?: string | null
          background?: string | null
          attributes?: Json
          first_appearance_chapter_id?: string | null
          is_protagonist?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          novel_id?: string
          name?: string
          aliases?: string[]
          avatar_url?: string | null
          description?: string | null
          personality?: string | null
          background?: string | null
          attributes?: Json
          first_appearance_chapter_id?: string | null
          is_protagonist?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      character_states: {
        Row: {
          id: string
          character_id: string
          chapter_id: string
          state_type: string
          state_key: string
          state_value: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          character_id: string
          chapter_id: string
          state_type: string
          state_key: string
          state_value: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          chapter_id?: string
          state_type?: string
          state_key?: string
          state_value?: string
          description?: string | null
          created_at?: string
        }
      }
      character_relationships: {
        Row: {
          id: string
          novel_id: string
          from_character_id: string
          to_character_id: string
          relationship_type: string
          description: string | null
          strength: number
          established_chapter_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          novel_id: string
          from_character_id: string
          to_character_id: string
          relationship_type: string
          description?: string | null
          strength?: number
          established_chapter_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          novel_id?: string
          from_character_id?: string
          to_character_id?: string
          relationship_type?: string
          description?: string | null
          strength?: number
          established_chapter_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          novel_id: string
          name: string
          parent_id: string | null
          description: string | null
          environment_keywords: string[]
          map_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          novel_id: string
          name: string
          parent_id?: string | null
          description?: string | null
          environment_keywords?: string[]
          map_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          novel_id?: string
          name?: string
          parent_id?: string | null
          description?: string | null
          environment_keywords?: string[]
          map_data?: Json | null
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          novel_id: string
          name: string
          category: string
          description: string | null
          attributes: Json
          owner_id: string | null
          first_appearance_chapter_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          novel_id: string
          name: string
          category: string
          description?: string | null
          attributes?: Json
          owner_id?: string | null
          first_appearance_chapter_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          novel_id?: string
          name?: string
          category?: string
          description?: string | null
          attributes?: Json
          owner_id?: string | null
          first_appearance_chapter_id?: string | null
          created_at?: string
        }
      }
      wiki_entries: {
        Row: {
          id: string
          novel_id: string
          category: string
          title: string
          content: string
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          novel_id: string
          category: string
          title: string
          content: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          novel_id?: string
          category?: string
          title?: string
          content?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      change_logs: {
        Row: {
          id: string
          novel_id: string
          chapter_id: string | null
          change_type: string
          entity_type: string
          entity_id: string | null
          old_value: Json | null
          new_value: Json
          description: string
          is_confirmed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          novel_id: string
          chapter_id?: string | null
          change_type: string
          entity_type: string
          entity_id?: string | null
          old_value?: Json | null
          new_value: Json
          description: string
          is_confirmed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          novel_id?: string
          chapter_id?: string | null
          change_type?: string
          entity_type?: string
          entity_id?: string | null
          old_value?: Json | null
          new_value?: Json
          description?: string
          is_confirmed?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 便捷类型别名
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Novel = Database['public']['Tables']['novels']['Row']
export type Volume = Database['public']['Tables']['volumes']['Row']
export type Chapter = Database['public']['Tables']['chapters']['Row']
export type Character = Database['public']['Tables']['characters']['Row']
export type CharacterState = Database['public']['Tables']['character_states']['Row']
export type CharacterRelationship = Database['public']['Tables']['character_relationships']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type WikiEntry = Database['public']['Tables']['wiki_entries']['Row']
export type ChangeLog = Database['public']['Tables']['change_logs']['Row']

// Insert 类型
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type NovelInsert = Database['public']['Tables']['novels']['Insert']
export type VolumeInsert = Database['public']['Tables']['volumes']['Insert']
export type ChapterInsert = Database['public']['Tables']['chapters']['Insert']
export type CharacterInsert = Database['public']['Tables']['characters']['Insert']
export type CharacterStateInsert = Database['public']['Tables']['character_states']['Insert']
export type CharacterRelationshipInsert = Database['public']['Tables']['character_relationships']['Insert']
export type LocationInsert = Database['public']['Tables']['locations']['Insert']
export type ItemInsert = Database['public']['Tables']['items']['Insert']
export type WikiEntryInsert = Database['public']['Tables']['wiki_entries']['Insert']
export type ChangeLogInsert = Database['public']['Tables']['change_logs']['Insert']

// Update 类型
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type NovelUpdate = Database['public']['Tables']['novels']['Update']
export type VolumeUpdate = Database['public']['Tables']['volumes']['Update']
export type ChapterUpdate = Database['public']['Tables']['chapters']['Update']
export type CharacterUpdate = Database['public']['Tables']['characters']['Update']
export type CharacterStateUpdate = Database['public']['Tables']['character_states']['Update']
export type CharacterRelationshipUpdate = Database['public']['Tables']['character_relationships']['Update']
export type LocationUpdate = Database['public']['Tables']['locations']['Update']
export type ItemUpdate = Database['public']['Tables']['items']['Update']
export type WikiEntryUpdate = Database['public']['Tables']['wiki_entries']['Update']
export type ChangeLogUpdate = Database['public']['Tables']['change_logs']['Update']
