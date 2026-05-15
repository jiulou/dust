import { Box, Button, Flex, Heading, Separator } from "@chakra-ui/react"
import { createRoute, useRouter } from "@tanstack/react-router"
import { useEffect, useMemo, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { FiArrowLeft, FiTrash2 } from "react-icons/fi"
import { Route as rootRoute } from "./__root"
import { useScanStore } from "../stores/scanStore"
import { StatsPanel } from "../components/dashboard/StatsPanel"
import { ResultList } from "../components/dashboard/ResultList"
import { HarvestDialog } from "../components/harvest/HarvestDialog"
import { invoke } from "@tauri-apps/api/core"

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/results",
  component: ResultsPage,
})

function formatBytes(bytes: number) {
  const u = ["B", "KB", "MB", "GB", "TB"]
  let s = bytes, i = 0
  while (s >= 1024 && i < u.length - 1) { s /= 1024; i++ }
  return `${i === 0 ? s : s.toFixed(1)} ${u[i]}`
}

function ResultsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const results = useScanStore((s) => s.lastResults)
  const summary = useScanStore((s) => s.lastSummary)
  const selectedPaths = useScanStore((s) => s.selectedPaths)
  const toggleItem = useScanStore((s) => s.toggleItem)
  const deselectAll = useScanStore((s) => s.deselectAll)

  const [removedPaths, setRemovedPaths] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toast, setToast] = useState("")

  const visible = useMemo(() => results.filter((r) => !removedPaths.includes(r.path)), [results, removedPaths])
  const adjustedSummary = useMemo(() => summary ? {
    ...summary,
    total_projects: visible.length,
    tech_stacks: summary.tech_stacks
      .map((s) => {
        const filtered = visible.filter((r) => r.tech_stack === s.tech_stack)
        return { ...s, count: filtered.length, total_size: filtered.reduce((a, r) => a + r.size, 0) }
      })
      .filter((s) => s.count > 0),
  } : undefined, [summary, visible])

  const selectedItems = useMemo(() => visible.filter((r) => selectedPaths.includes(r.path)), [visible, selectedPaths])
  const selectedSize = useMemo(() => selectedItems.reduce((s, r) => s + r.size, 0), [selectedItems])
  const selectedPathsList = useMemo(() => selectedItems.map((r) => r.path), [selectedItems])

  const [partitions, setPartitions] = useState<string[]>([])
  useEffect(() => {
    if (selectedPathsList.length > 0) {
      invoke<string[]>("get_partitions", { paths: selectedPathsList }).then(setPartitions).catch(() => setPartitions([]))
    } else { setPartitions([]) }
  }, [selectedPathsList])

  const selectAll = useCallback(() => {
    useScanStore.getState().selectAll(visible.map((r) => r.path))
  }, [visible])

  const handleHarvestDone = useCallback(() => {
    setRemovedPaths((prev) => [...prev, ...selectedPathsList])
    deselectAll()
    setToast(t("dashboard.reclaimed", { size: formatBytes(selectedSize) }))
    setTimeout(() => setToast(""), 3000)
  }, [selectedPathsList, selectedSize, deselectAll, t])

  if (!summary) {
    return (
      <Box>
        <Button variant="ghost" onClick={() => router.navigate({ to: "/" })}><FiArrowLeft />{t("dashboard.back")}</Button>
        <Box textAlign="center" py={10} color="fg.muted">{t("dashboard.noResultsYet")}</Box>
      </Box>
    )
  }

  return (
    <Flex direction="column" height="100%" gap={4}>
      {/* Fixed header */}
      <Flex align="center" gap={4}>
        <Button variant="ghost" size="sm" onClick={() => router.navigate({ to: "/" })}><FiArrowLeft /></Button>
        <Heading size="lg">{t("dashboard.title")}</Heading>
      </Flex>

      <StatsPanel summary={adjustedSummary} zombieCount={visible.filter((r) => r.is_zombie).length} />
      <Separator />

      {/* Scrollable table fills remaining space */}
      <Box flex={1} minH={0}>
        <ResultList results={visible} selectedPaths={selectedPaths} onToggle={toggleItem} onSelectAll={selectAll} onDeselectAll={deselectAll} fillHeight />
      </Box>

      {selectedItems.length > 0 && (
        <Box position="fixed" bottom={0} left={0} right={0} bg="bg.panel" borderTopWidth="1px" px={6} py={3} zIndex={20}>
          <Flex justify="space-between" align="center">
            <Box fontSize="sm">{t("dashboard.selected", { count: selectedItems.length, size: formatBytes(selectedSize) })}</Box>
            <Flex gap={2}>
              <Button size="sm" variant="ghost" onClick={deselectAll}>{t("common.cancel")}</Button>
              <Button colorPalette="red" size="sm" onClick={() => setDialogOpen(true)}>
                <FiTrash2 />{t("dashboard.moveToTrash")}
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}



      {toast && (
        <Box position="fixed" bottom={4} right={4} bg="brand.solid" color="brand.contrast" px={4} py={2} borderRadius="md" zIndex={30} fontSize="sm">
          {toast}
        </Box>
      )}

      <HarvestDialog open={dialogOpen} onClose={() => setDialogOpen(false)} itemCount={selectedItems.length}
        totalSize={formatBytes(selectedSize)} paths={selectedPathsList} partitions={partitions} onDone={handleHarvestDone} />
    </Flex>
  )
}
