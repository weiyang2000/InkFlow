import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  Character,
  CharacterRelationship,
  Location,
  Item,
  WikiEntry,
  ChangeLog
} from '@/lib/types'

interface WikiState {
  // Data
  characters: Character[]
  relationships: CharacterRelationship[]
  locations: Location[]
  items: Item[]
  wikiEntries: WikiEntry[]
  changeLogs: ChangeLog[]

  // Selected items
  selectedCharacter: Character | null
  selectedLocation: Location | null
  selectedItem: Item | null

  // Loading
  isLoading: boolean

  // Actions - Characters
  setCharacters: (characters: Character[]) => void
  addCharacter: (character: Character) => void
  updateCharacter: (id: string, data: Partial<Character>) => void
  removeCharacter: (id: string) => void
  setSelectedCharacter: (character: Character | null) => void

  // Actions - Relationships
  setRelationships: (relationships: CharacterRelationship[]) => void
  addRelationship: (relationship: CharacterRelationship) => void
  updateRelationship: (id: string, data: Partial<CharacterRelationship>) => void
  removeRelationship: (id: string) => void

  // Actions - Locations
  setLocations: (locations: Location[]) => void
  addLocation: (location: Location) => void
  updateLocation: (id: string, data: Partial<Location>) => void
  removeLocation: (id: string) => void
  setSelectedLocation: (location: Location | null) => void

  // Actions - Items
  setItems: (items: Item[]) => void
  addItem: (item: Item) => void
  updateItem: (id: string, data: Partial<Item>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: Item | null) => void

  // Actions - Wiki Entries
  setWikiEntries: (entries: WikiEntry[]) => void
  addWikiEntry: (entry: WikiEntry) => void
  updateWikiEntry: (id: string, data: Partial<WikiEntry>) => void
  removeWikiEntry: (id: string) => void

  // Actions - Change Logs
  setChangeLogs: (logs: ChangeLog[]) => void
  confirmChangeLog: (id: string) => void
  rejectChangeLog: (id: string) => void

  setLoading: (loading: boolean) => void

  // Computed
  getCharacterById: (id: string) => Character | undefined
  getRelationshipsForCharacter: (characterId: string) => CharacterRelationship[]
  getChildLocations: (parentId: string) => Location[]
  getItemsByOwner: (ownerId: string) => Item[]
  getPendingChangeLogs: () => ChangeLog[]
}

export const useWikiStore = create<WikiState>()(
  devtools(
    (set, get) => ({
      // Initial state
      characters: [],
      relationships: [],
      locations: [],
      items: [],
      wikiEntries: [],
      changeLogs: [],
      selectedCharacter: null,
      selectedLocation: null,
      selectedItem: null,
      isLoading: false,

      // Character actions
      setCharacters: (characters) => set({ characters }),
      addCharacter: (character) => set((state) => ({
        characters: [...state.characters, character]
      })),
      updateCharacter: (id, data) => set((state) => ({
        characters: state.characters.map((c) =>
          c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
        ),
        selectedCharacter: state.selectedCharacter?.id === id
          ? { ...state.selectedCharacter, ...data, updatedAt: new Date() }
          : state.selectedCharacter
      })),
      removeCharacter: (id) => set((state) => ({
        characters: state.characters.filter((c) => c.id !== id),
        selectedCharacter: state.selectedCharacter?.id === id
          ? null
          : state.selectedCharacter
      })),
      setSelectedCharacter: (character) => set({ selectedCharacter: character }),

      // Relationship actions
      setRelationships: (relationships) => set({ relationships }),
      addRelationship: (relationship) => set((state) => ({
        relationships: [...state.relationships, relationship]
      })),
      updateRelationship: (id, data) => set((state) => ({
        relationships: state.relationships.map((r) =>
          r.id === id ? { ...r, ...data, updatedAt: new Date() } : r
        )
      })),
      removeRelationship: (id) => set((state) => ({
        relationships: state.relationships.filter((r) => r.id !== id)
      })),

      // Location actions
      setLocations: (locations) => set({ locations }),
      addLocation: (location) => set((state) => ({
        locations: [...state.locations, location]
      })),
      updateLocation: (id, data) => set((state) => ({
        locations: state.locations.map((l) =>
          l.id === id ? { ...l, ...data } : l
        ),
        selectedLocation: state.selectedLocation?.id === id
          ? { ...state.selectedLocation, ...data }
          : state.selectedLocation
      })),
      removeLocation: (id) => set((state) => ({
        locations: state.locations.filter((l) => l.id !== id),
        selectedLocation: state.selectedLocation?.id === id
          ? null
          : state.selectedLocation
      })),
      setSelectedLocation: (location) => set({ selectedLocation: location }),

      // Item actions
      setItems: (items) => set({ items }),
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),
      updateItem: (id, data) => set((state) => ({
        items: state.items.map((i) =>
          i.id === id ? { ...i, ...data } : i
        ),
        selectedItem: state.selectedItem?.id === id
          ? { ...state.selectedItem, ...data }
          : state.selectedItem
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
        selectedItem: state.selectedItem?.id === id
          ? null
          : state.selectedItem
      })),
      setSelectedItem: (item) => set({ selectedItem: item }),

      // Wiki entry actions
      setWikiEntries: (wikiEntries) => set({ wikiEntries }),
      addWikiEntry: (entry) => set((state) => ({
        wikiEntries: [...state.wikiEntries, entry]
      })),
      updateWikiEntry: (id, data) => set((state) => ({
        wikiEntries: state.wikiEntries.map((e) =>
          e.id === id ? { ...e, ...data, updatedAt: new Date() } : e
        )
      })),
      removeWikiEntry: (id) => set((state) => ({
        wikiEntries: state.wikiEntries.filter((e) => e.id !== id)
      })),

      // Change log actions
      setChangeLogs: (changeLogs) => set({ changeLogs }),
      confirmChangeLog: (id) => set((state) => ({
        changeLogs: state.changeLogs.map((log) =>
          log.id === id ? { ...log, isConfirmed: true } : log
        )
      })),
      rejectChangeLog: (id) => set((state) => ({
        changeLogs: state.changeLogs.filter((log) => log.id !== id)
      })),

      setLoading: (isLoading) => set({ isLoading }),

      // Computed
      getCharacterById: (id) => {
        return get().characters.find((c) => c.id === id)
      },

      getRelationshipsForCharacter: (characterId) => {
        return get().relationships.filter(
          (r) => r.fromCharacterId === characterId || r.toCharacterId === characterId
        )
      },

      getChildLocations: (parentId) => {
        return get().locations.filter((l) => l.parentId === parentId)
      },

      getItemsByOwner: (ownerId) => {
        return get().items.filter((i) => i.ownerId === ownerId)
      },

      getPendingChangeLogs: () => {
        return get().changeLogs.filter((log) => !log.isConfirmed)
      }
    }),
    { name: 'wiki-store' }
  )
)
