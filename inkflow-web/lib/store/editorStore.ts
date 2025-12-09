import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { WritingMode, PlanOption, ConsistencyWarning } from '@/lib/types'

interface EditorState {
  // Content
  content: string
  selection: { from: number; to: number } | null

  // AI state
  isGenerating: boolean
  streamingContent: string
  currentMode: WritingMode
  planOptions: PlanOption[]
  selectedPlanId: string | null

  // Copilot
  isCopilotOpen: boolean
  copilotMessages: Array<{ role: 'user' | 'assistant'; content: string }>

  // Warnings
  consistencyWarnings: ConsistencyWarning[]

  // Actions
  setContent: (content: string) => void
  setSelection: (selection: { from: number; to: number } | null) => void
  appendContent: (text: string) => void

  setIsGenerating: (generating: boolean) => void
  setStreamingContent: (content: string) => void
  appendStreamingContent: (text: string) => void
  clearStreamingContent: () => void

  setCurrentMode: (mode: WritingMode) => void
  setPlanOptions: (options: PlanOption[]) => void
  setSelectedPlanId: (id: string | null) => void
  clearPlanOptions: () => void

  toggleCopilot: () => void
  setCopilotOpen: (open: boolean) => void
  addCopilotMessage: (message: { role: 'user' | 'assistant'; content: string }) => void
  clearCopilotMessages: () => void

  setConsistencyWarnings: (warnings: ConsistencyWarning[]) => void
  addConsistencyWarning: (warning: ConsistencyWarning) => void
  dismissWarning: (id: string) => void

  // Computed
  getWordCount: () => number
}

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      // Initial state
      content: '',
      selection: null,
      isGenerating: false,
      streamingContent: '',
      currentMode: 'plot',
      planOptions: [],
      selectedPlanId: null,
      isCopilotOpen: false,
      copilotMessages: [],
      consistencyWarnings: [],

      // Content actions
      setContent: (content) => set({ content }),
      setSelection: (selection) => set({ selection }),
      appendContent: (text) => set((state) => ({
        content: state.content + text
      })),

      // AI generation actions
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setStreamingContent: (streamingContent) => set({ streamingContent }),
      appendStreamingContent: (text) => set((state) => ({
        streamingContent: state.streamingContent + text
      })),
      clearStreamingContent: () => set({ streamingContent: '' }),

      // Mode and plan actions
      setCurrentMode: (currentMode) => set({ currentMode }),
      setPlanOptions: (planOptions) => set({ planOptions }),
      setSelectedPlanId: (selectedPlanId) => set({ selectedPlanId }),
      clearPlanOptions: () => set({ planOptions: [], selectedPlanId: null }),

      // Copilot actions
      toggleCopilot: () => set((state) => ({ isCopilotOpen: !state.isCopilotOpen })),
      setCopilotOpen: (isCopilotOpen) => set({ isCopilotOpen }),
      addCopilotMessage: (message) => set((state) => ({
        copilotMessages: [...state.copilotMessages, message]
      })),
      clearCopilotMessages: () => set({ copilotMessages: [] }),

      // Warning actions
      setConsistencyWarnings: (consistencyWarnings) => set({ consistencyWarnings }),
      addConsistencyWarning: (warning) => set((state) => ({
        consistencyWarnings: [...state.consistencyWarnings, warning]
      })),
      dismissWarning: (id) => set((state) => ({
        consistencyWarnings: state.consistencyWarnings.filter((w) => w.id !== id)
      })),

      // Computed
      getWordCount: () => {
        const { content } = get()
        // Chinese character count (more accurate for Chinese text)
        const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
        // English words
        const englishWords = (content.match(/[a-zA-Z]+/g) || []).length
        return chineseChars + englishWords
      }
    }),
    { name: 'editor-store' }
  )
)
