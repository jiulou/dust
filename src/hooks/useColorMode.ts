import { useEffect } from "react"
import { create } from "zustand"

export type ColorMode = "light" | "dark" | "system"

function getSystemPreference(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyClass(mode: ColorMode) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  if (mode === "system") {
    root.classList.add(getSystemPreference())
  } else {
    root.classList.add(mode)
  }
}

function getActiveMode(): ColorMode {
  const root = document.documentElement
  if (root.classList.contains("dark")) return "dark"
  if (root.classList.contains("light")) return "light"
  return "system"
}

interface ColorModeStore {
  colorMode: ColorMode
  effective: "light" | "dark"
  setColorMode: (mode: ColorMode) => void
  toggleColorMode: () => void
}

const useColorModeStore = create<ColorModeStore>((set, get) => ({
  colorMode: getActiveMode(),
  effective: getActiveMode() === "system" ? getSystemPreference() : (getActiveMode() as "light" | "dark"),

  setColorMode: (mode) => {
    applyClass(mode)
    set({
      colorMode: mode,
      effective: mode === "system" ? getSystemPreference() : (mode as "light" | "dark"),
    })
  },

  toggleColorMode: () => {
    const current = get().colorMode
    const next: ColorMode = current === "dark" ? "light" : current === "light" ? "system" : "dark"
    get().setColorMode(next)
  },
}))

// Listen for system preference changes when in "system" mode
if (typeof window !== "undefined") {
  const mq = window.matchMedia("(prefers-color-scheme: dark)")
  mq.addEventListener("change", () => {
    const state = useColorModeStore.getState()
    if (state.colorMode === "system") {
      applyClass("system")
      useColorModeStore.setState({ effective: getSystemPreference() })
    }
  })
}

export function useColorMode() {
  const colorMode = useColorModeStore((s) => s.colorMode)
  const effective = useColorModeStore((s) => s.effective)
  const setColorMode = useColorModeStore((s) => s.setColorMode)
  const toggleColorMode = useColorModeStore((s) => s.toggleColorMode)

  // Apply initial class on first mount
  useEffect(() => { applyClass(colorMode) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { colorMode, effective, toggleColorMode, setColorMode }
}
