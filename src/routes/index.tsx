import { Box, Button, Flex, Heading, Progress, Text, VStack } from "@chakra-ui/react"
import { createRoute, useRouter } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { FiSearch } from "react-icons/fi"
import { Route as rootRoute } from "./__root"
import { DropZone } from "../components/dashboard/DropZone"
import { useScan } from "../hooks/useScan"
import { useScanStore } from "../stores/scanStore"
import { useSettingsStore } from "../stores/settingsStore"

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
})

function DashboardPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const scanPaths = useScanStore((s) => s.scanPaths)
  const addScanPath = useScanStore((s) => s.addScanPath)
  const removeScanPath = useScanStore((s) => s.removeScanPath)
  const setResults = useScanStore((s) => s.setResults)
  const zombieThresholdDays = useSettingsStore((s) => s.settings.zombieThresholdDays)

  const [started, setStarted] = useState(false)
  const [progressState, setProgressState] = useState({ current: 0, total: 0, found: 0 })

  const onProgress = useCallback((p: { current: number; total: number; found: number }) => {
    setProgressState(p)
  }, [])

  const { data, isFetching, error, refetch } = useScan({
    paths: scanPaths,
    enabled: started && scanPaths.length > 0,
    onProgress,
    zombieThresholdDays,
  })

  // Navigate to results when scan completes
  useEffect(() => {
    if (data) {
      setResults(data.results, data.summary)
      router.navigate({ to: "/results" })
    }
  }, [data, setResults, router])

  // Keyboard shortcuts
  const scanFn = useCallback(() => {
    setStarted(true)
    refetch()
  }, [refetch])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); scanFn() }
      if ((e.metaKey || e.ctrlKey) && e.key === "Backspace" && scanPaths.length > 0) { e.preventDefault(); removeScanPath(scanPaths.length - 1) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [scanFn, removeScanPath, scanPaths])

  return (
    <VStack gap={6} align="stretch">
      <Heading size="lg">{t("dashboard.title")}</Heading>

      <DropZone onAdd={addScanPath} />

      {scanPaths.length > 0 && (
        <Flex gap={2} wrap="wrap" align="center" mb={2}>
          {scanPaths.map((p, i) => (
            <Flex key={p} px={3} py={1} bg="bg.subtle" borderRadius="md" fontSize="sm" align="center" gap={2}>
              <Box>{p}</Box>
              <Box as="span" cursor="pointer" color="fg.muted" _hover={{ color: "fg" }} onClick={() => removeScanPath(i)}>×</Box>
            </Flex>
          ))}
          <Button size="xs" variant="ghost" color="fg.muted" onClick={() => useScanStore.setState({ scanPaths: [] })}>{t("dashboard.clearAll")}</Button>
        </Flex>
      )}

      <Button w="full" size="lg" colorPalette="brand" onClick={scanFn} loading={isFetching} disabled={scanPaths.length === 0} mt={scanPaths.length > 0 ? 2 : 0}>
        <FiSearch />
        {isFetching ? t("dashboard.scanning") : t("dashboard.startScan")}
      </Button>

      {isFetching && (
        <Box py={12} px={4}>
          <VStack gap={4} maxW="sm" mx="auto">
            <Progress.Root w="full" colorPalette="brand" size="lg" value={null}>
              <Progress.Track><Progress.Range /></Progress.Track>
            </Progress.Root>
            <Text color="fg.muted" fontSize="sm">
              {progressState.found > 0 ? t("dashboard.itemsFound", { found: progressState.found }) : t("dashboard.scanning")}
            </Text>
          </VStack>
        </Box>
      )}

      {error && <Box p={4} bg="bg.subtle" borderRadius="md" color="fg.muted" fontSize="sm">{t("dashboard.scanFailed", { message: error.message })}</Box>}

      {!isFetching && !error && started && !data && (
        <Box textAlign="center" py={10} color="fg.muted" fontSize="sm">{t("dashboard.noDeps")}</Box>
      )}

      {!isFetching && !started && scanPaths.length === 0 && (
        <Box textAlign="center" py={6} color="fg.muted" fontSize="sm">{t("dashboard.idle")}</Box>
      )}
    </VStack>
  )
}
