import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'
type SidebarTab = 'chapters' | 'wiki' | 'ai'
type AiPanelTab = 'generate' | 'chat' | 'characters'

interface UIState {
  // Theme
  theme: Theme

  // Sidebar
  isSidebarOpen: boolean
  sidebarTab: SidebarTab
  sidebarWidth: number

  // Editor layout
  isOutlineVisible: boolean
  isAiPanelOpen: boolean
  aiPanelWidth: number
  aiPanelTab: AiPanelTab
  currentChapterId: string | null

  // Modals
  isSettingsOpen: boolean
  isExportOpen: boolean
  isSearchOpen: boolean

  // Mobile
  isMobileMenuOpen: boolean

  // Actions
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarTab: (tab: SidebarTab) => void
  setSidebarWidth: (width: number) => void

  toggleOutline: () => void
  setOutlineVisible: (visible: boolean) => void
  toggleAiPanel: () => void
  setAiPanelOpen: (open: boolean) => void
  setAiPanelWidth: (width: number) => void
  setAiPanelTab: (tab: AiPanelTab) => void
  openAiPanelWithTab: (tab: AiPanelTab) => void
  setCurrentChapterId: (chapterId: string | null) => void

  openSettings: () => void
  closeSettings: () => void
  openExport: () => void
  closeExport: () => void
  openSearch: () => void
  closeSearch: () => void

  toggleMobileMenu: () => void
  closeMobileMenu: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        theme: 'system',
        isSidebarOpen: true,
        sidebarTab: 'chapters',
        sidebarWidth: 280,
        isOutlineVisible: false,
        isAiPanelOpen: false,
        aiPanelWidth: 360,
        aiPanelTab: 'generate',
        currentChapterId: null,
        isSettingsOpen: false,
        isExportOpen: false,
        isSearchOpen: false,
        isMobileMenuOpen: false,

        // Theme
        setTheme: (theme) => set({ theme }),

        // Sidebar
        toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
        setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
        setSidebarTab: (sidebarTab) => set({ sidebarTab }),
        setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),

        // Editor layout
        toggleOutline: () => set((state) => ({ isOutlineVisible: !state.isOutlineVisible })),
        setOutlineVisible: (isOutlineVisible) => set({ isOutlineVisible }),
        toggleAiPanel: () => set((state) => ({ isAiPanelOpen: !state.isAiPanelOpen })),
        setAiPanelOpen: (isAiPanelOpen) => set({ isAiPanelOpen }),
        setAiPanelWidth: (aiPanelWidth) => set({ aiPanelWidth }),
        setAiPanelTab: (aiPanelTab) => set({ aiPanelTab }),
        openAiPanelWithTab: (aiPanelTab) => set({ isAiPanelOpen: true, aiPanelTab }),
        setCurrentChapterId: (currentChapterId) => set({ currentChapterId }),

        // Modals
        openSettings: () => set({ isSettingsOpen: true }),
        closeSettings: () => set({ isSettingsOpen: false }),
        openExport: () => set({ isExportOpen: true }),
        closeExport: () => set({ isExportOpen: false }),
        openSearch: () => set({ isSearchOpen: true }),
        closeSearch: () => set({ isSearchOpen: false }),

        // Mobile
        toggleMobileMenu: () => set((state) => ({
          isMobileMenuOpen: !state.isMobileMenuOpen
        })),
        closeMobileMenu: () => set({ isMobileMenuOpen: false })
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          theme: state.theme,
          sidebarWidth: state.sidebarWidth,
          aiPanelWidth: state.aiPanelWidth
        })
      }
    ),
    { name: 'ui-store' }
  )
)
