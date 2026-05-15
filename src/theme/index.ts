import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.teal.600}" },
          contrast: { value: "{colors.white}" },
          fg: { value: "{colors.teal.700}" },
          muted: { value: "{colors.teal.100}" },
          subtle: { value: "{colors.teal.200}" },
          emphasized: { value: "{colors.teal.300}" },
          focusRing: { value: "{colors.teal.500}" },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
