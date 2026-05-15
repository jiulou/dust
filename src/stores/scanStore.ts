import { create } from "zustand"
import type { ScanResult, ScanSummary } from "../types/scan"

interface ScanState {
  selectedPaths: string[]
  scanPaths: string[]
  lastResults: ScanResult[]
  lastSummary: ScanSummary | null
  toggleItem: (path: string) => void
  selectAll: (paths: string[]) => void
  deselectAll: () => void
  addScanPath: (path: string) => void
  removeScanPath: (index: number) => void
  isSelected: (path: string) => boolean
  setResults: (results: ScanResult[], summary: ScanSummary) => void
}

export const useScanStore = create<ScanState>((set, get) => ({
  selectedPaths: [],
  scanPaths: [],
  lastResults: [],
  lastSummary: null,

  toggleItem: (path) =>
    set((state) => {
      const exists = state.selectedPaths.includes(path)
      return {
        selectedPaths: exists
          ? state.selectedPaths.filter((p) => p !== path)
          : [...state.selectedPaths, path],
      }
    }),

  selectAll: (paths) => set({ selectedPaths: [...paths] }),

  deselectAll: () => set({ selectedPaths: [] }),

  addScanPath: (path) =>
    set((state) => ({
      scanPaths: state.scanPaths.includes(path)
        ? state.scanPaths
        : [...state.scanPaths, path],
    })),

  removeScanPath: (index) =>
    set((state) => ({
      scanPaths: state.scanPaths.filter((_, i) => i !== index),
    })),

  isSelected: (path) => get().selectedPaths.includes(path),

  setResults: (results, summary) => set({ lastResults: results, lastSummary: summary }),
}))
