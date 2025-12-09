import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Novel, Chapter, Volume, CreateNovelInput, UpdateNovelInput } from '@/lib/types'

interface NovelState {
  // Data
  novels: Novel[]
  currentNovel: Novel | null
  chapters: Chapter[]
  volumes: Volume[]
  currentChapter: Chapter | null

  // Loading states
  isLoading: boolean
  isSaving: boolean

  // Actions
  setNovels: (novels: Novel[]) => void
  setCurrentNovel: (novel: Novel | null) => void
  setChapters: (chapters: Chapter[]) => void
  setVolumes: (volumes: Volume[]) => void
  setCurrentChapter: (chapter: Chapter | null) => void

  addNovel: (novel: Novel) => void
  updateNovel: (id: string, data: UpdateNovelInput) => void
  removeNovel: (id: string) => void

  addChapter: (chapter: Chapter) => void
  updateChapter: (id: string, data: Partial<Chapter>) => void
  removeChapter: (id: string) => void
  reorderChapters: (chapters: Chapter[]) => void

  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void

  // Computed
  getTotalWordCount: () => number
  getChaptersByVolume: (volumeId?: string) => Chapter[]
}

export const useNovelStore = create<NovelState>()(
  devtools(
    (set, get) => ({
      // Initial state
      novels: [],
      currentNovel: null,
      chapters: [],
      volumes: [],
      currentChapter: null,
      isLoading: false,
      isSaving: false,

      // Setters
      setNovels: (novels) => set({ novels }),
      setCurrentNovel: (novel) => set({ currentNovel: novel }),
      setChapters: (chapters) => set({ chapters }),
      setVolumes: (volumes) => set({ volumes }),
      setCurrentChapter: (chapter) => set({ currentChapter: chapter }),

      // Novel actions
      addNovel: (novel) => set((state) => ({
        novels: [...state.novels, novel]
      })),

      updateNovel: (id, data) => set((state) => ({
        novels: state.novels.map((n) =>
          n.id === id ? { ...n, ...data, updatedAt: new Date() } : n
        ),
        currentNovel: state.currentNovel?.id === id
          ? { ...state.currentNovel, ...data, updatedAt: new Date() }
          : state.currentNovel
      })),

      removeNovel: (id) => set((state) => ({
        novels: state.novels.filter((n) => n.id !== id),
        currentNovel: state.currentNovel?.id === id ? null : state.currentNovel
      })),

      // Chapter actions
      addChapter: (chapter) => set((state) => ({
        chapters: [...state.chapters, chapter]
      })),

      updateChapter: (id, data) => set((state) => ({
        chapters: state.chapters.map((c) =>
          c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
        ),
        currentChapter: state.currentChapter?.id === id
          ? { ...state.currentChapter, ...data, updatedAt: new Date() }
          : state.currentChapter
      })),

      removeChapter: (id) => set((state) => ({
        chapters: state.chapters.filter((c) => c.id !== id),
        currentChapter: state.currentChapter?.id === id ? null : state.currentChapter
      })),

      reorderChapters: (chapters) => set({ chapters }),

      // Loading states
      setLoading: (isLoading) => set({ isLoading }),
      setSaving: (isSaving) => set({ isSaving }),

      // Computed values
      getTotalWordCount: () => {
        const { chapters } = get()
        return chapters.reduce((sum, c) => sum + c.wordCount, 0)
      },

      getChaptersByVolume: (volumeId) => {
        const { chapters } = get()
        return chapters
          .filter((c) => volumeId ? c.volumeId === volumeId : !c.volumeId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
      }
    }),
    { name: 'novel-store' }
  )
)
