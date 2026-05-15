import { ChakraProvider } from "@chakra-ui/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { useEffect } from "react"
import { router } from "./router"
import { system } from "./theme"
import { useConfig } from "./hooks/useConfig"
import { useThemeColor } from "./hooks/useThemeColor"
import { useColorMode } from "./hooks/useColorMode"
import { useSettingsStore } from "./stores/settingsStore"
import "./i18n"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppInner() {
  const settings = useSettingsStore((s) => s.settings)
  const { setColorMode } = useColorMode()

  useConfig()
  useThemeColor(settings.themeColor)

  // Sync color mode from loaded config
  useEffect(() => { setColorMode(settings.colorMode as "light" | "dark" | "system") }, [settings.colorMode, setColorMode])

  return <RouterProvider router={router} />
}

function App() {
  return (
    <ChakraProvider value={system}>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </ChakraProvider>
  )
}

export default App
