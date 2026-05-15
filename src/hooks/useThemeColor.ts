import { useEffect } from "react"

const brandTokens: Record<string, string> = {
  solid: "600",
  fg: "700",
  muted: "100",
  subtle: "200",
  emphasized: "300",
  focusRing: "500",
}

function applyThemeColor(color: string) {
  const root = document.documentElement
  for (const [token, shade] of Object.entries(brandTokens)) {
    const value = getComputedStyle(root).getPropertyValue(`--chakra-colors-${color}-${shade}`).trim()
    if (value) {
      root.style.setProperty(`--chakra-colors-brand-${token}`, value)
    }
  }
  root.style.setProperty("--chakra-colors-brand-contrast", "#ffffff")
}

export function useThemeColor(color: string) {
  useEffect(() => {
    applyThemeColor(color)
  }, [color])
}
