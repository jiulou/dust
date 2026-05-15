import type { ScanRule } from "./scan"

export type ThemeColor = "teal" | "blue" | "purple" | "green" | "orange" | "red" | "pink" | "cyan"
export type ColorMode = "light" | "dark" | "system"
export type Language = "zh" | "en"

export interface Settings {
  whitelist: string[]
  customRules: ScanRule[]
  zombieThresholdDays: number
  themeColor: ThemeColor
  colorMode: ColorMode
  language: Language
}
