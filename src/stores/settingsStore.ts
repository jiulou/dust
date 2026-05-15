import { create } from "zustand"
import type { Settings, ThemeColor, ColorMode, Language } from "../types/settings"
import type { ScanRule } from "../types/scan"

const DEFAULT_SETTINGS: Settings = {
  whitelist: [],
  customRules: [],
  zombieThresholdDays: 90,
  themeColor: "teal",
  colorMode: "system",
  language: "en",
}

interface SettingsState {
  settings: Settings
  updateThemeColor: (color: ThemeColor) => void
  updateColorMode: (mode: ColorMode) => void
  updateLanguage: (lang: Language) => void
  updateZombieThreshold: (days: number) => void
  addCustomRule: (rule: ScanRule) => void
  removeCustomRule: (index: number) => void
  addWhitelist: (path: string) => void
  removeWhitelist: (index: number) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: { ...DEFAULT_SETTINGS },

  updateThemeColor: (color) =>
    set((state) => ({
      settings: { ...state.settings, themeColor: color },
    })),

  updateColorMode: (mode) =>
    set((state) => ({
      settings: { ...state.settings, colorMode: mode },
    })),

  updateLanguage: (lang) =>
    set((state) => ({
      settings: { ...state.settings, language: lang },
    })),

  updateZombieThreshold: (days) =>
    set((state) => ({
      settings: { ...state.settings, zombieThresholdDays: days },
    })),

  addCustomRule: (rule) =>
    set((state) => ({
      settings: {
        ...state.settings,
        customRules: [...state.settings.customRules, rule],
      },
    })),

  removeCustomRule: (index) =>
    set((state) => ({
      settings: {
        ...state.settings,
        customRules: state.settings.customRules.filter((_, i) => i !== index),
      },
    })),

  addWhitelist: (path) =>
    set((state) => ({
      settings: {
        ...state.settings,
        whitelist: [...state.settings.whitelist, path],
      },
    })),

  removeWhitelist: (index) =>
    set((state) => ({
      settings: {
        ...state.settings,
        whitelist: state.settings.whitelist.filter((_, i) => i !== index),
      },
    })),

  resetSettings: () => set({ settings: { ...DEFAULT_SETTINGS } }),
}))
