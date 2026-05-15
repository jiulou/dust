import { invoke } from "@tauri-apps/api/core"
import { useEffect, useRef } from "react"
import { useSettingsStore } from "../stores/settingsStore"
import { useScanStore } from "../stores/scanStore"

export function useConfig() {
  const loaded = useRef(false)
  const settings = useSettingsStore((s) => s.settings)

  // Load settings from disk once
  useEffect(() => {
    if (loaded.current) return
    loaded.current = true

    invoke<{
      whitelist: string[]
      custom_rules: { target_dir: string; anchor_files: string[]; tech_stack: string }[]
      zombie_threshold_days: number
      theme_color: string
      color_mode: string
      language: string
      scan_paths: string[]
    }>("load_settings")
      .then((data) => {
        const store = useSettingsStore.getState()
        const s = { ...store.settings }
        let changed = false

        if (data.whitelist.length) { s.whitelist = data.whitelist; changed = true }
        if (data.custom_rules.length) {
          s.customRules = data.custom_rules.map((r) => ({
            target_dir: r.target_dir,
            anchor_files: r.anchor_files,
            tech_stack: r.tech_stack as import("../types/scan").ScanRule["tech_stack"],
          }))
          changed = true
        }
        if (data.zombie_threshold_days !== 90) { s.zombieThresholdDays = data.zombie_threshold_days; changed = true }
        if (data.theme_color !== "teal") { s.themeColor = data.theme_color as import("../types/settings").ThemeColor; changed = true }
        if (data.color_mode !== "system") { s.colorMode = data.color_mode as import("../types/settings").ColorMode; changed = true }
        if (data.language !== "zh") { s.language = data.language as import("../types/settings").Language; changed = true }

        if (changed) useSettingsStore.setState({ settings: s })
        if (data.scan_paths.length) useScanStore.setState({ scanPaths: data.scan_paths })
      })
      .catch(console.error)
  }, [])

  // Auto-save when settings change
  useEffect(() => {
    if (!loaded.current) return
    const scanPaths = useScanStore.getState().scanPaths
    const timeout = setTimeout(() => {
      invoke("save_settings", {
        settings: {
          whitelist: settings.whitelist,
          custom_rules: settings.customRules,
          zombie_threshold_days: settings.zombieThresholdDays,
          theme_color: settings.themeColor,
          color_mode: settings.colorMode,
          language: settings.language,
          scan_paths: scanPaths,
        },
      }).catch(console.error)
    }, 300)
    return () => clearTimeout(timeout)
  }, [settings])
}
