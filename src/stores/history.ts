import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ExtractedKey {
  id: string
  key: string
  timestamp: number
  isValid: boolean
}

interface HistoryState {
  history: ExtractedKey[]
  addKey: (key: ExtractedKey) => void
  removeKey: (id: string) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      addKey: (key) =>
        set((state) => ({
          history: [key, ...state.history].slice(0, 50),
        })),
      removeKey: (id) =>
        set((state) => ({
          history: state.history.filter((k) => k.id !== id),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'fiscal-ocr-history',
    }
  )
)