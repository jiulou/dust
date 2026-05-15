import { Box, Button, Flex, Input, NativeSelect, ScrollArea, VStack } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import type { ScanResult } from "../../types/scan"
import { ResultCard } from "./ResultCard"

interface ResultListProps {
  results: ScanResult[]
  selectedPaths: string[]
  onToggle: (path: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  fillHeight?: boolean
}

export function ResultList({ results, selectedPaths, onToggle, onSelectAll, onDeselectAll, fillHeight }: ResultListProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<"size" | "time" | "stack">("size")
  const [filterStack, setFilterStack] = useState("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "zombie" | "active">("all")
  const allSelected = results.length > 0 && selectedPaths.length === results.length

  const techStacks = useMemo(() => {
    const set = new Set(results.map((r) => r.tech_stack))
    return [...set].toSorted()
  }, [results])

  const filtered = useMemo(() => {
    let list = results
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((r) => r.path.toLowerCase().includes(q))
    }
    if (filterStack !== "all") {
      list = list.filter((r) => r.tech_stack === filterStack)
    }
    if (filterStatus === "zombie") {
      list = list.filter((r) => r.is_zombie)
    } else if (filterStatus === "active") {
      list = list.filter((r) => !r.is_zombie)
    }
    return list.toSorted((a, b) => {
      switch (sort) {
        case "time": return b.last_modified - a.last_modified
        case "stack": return a.tech_stack.localeCompare(b.tech_stack)
        default: return b.size - a.size
      }
    })
  }, [results, search, filterStack, sort])

  const listContent = (
    <VStack gap={2} align="stretch">
      {filtered.length === 0 && (
        <Box textAlign="center" py={8} color="fg.muted" fontSize="sm">{t("dashboard.noResults")}</Box>
      )}
      {filtered.map((item) => (
        <ResultCard key={item.path} item={item} selected={selectedPaths.includes(item.path)} onToggle={() => onToggle(item.path)} />
      ))}
    </VStack>
  )

  if (fillHeight) {
    return (
      <Flex direction="column" height="100%" gap={3}>
        <Flex gap={2} wrap="wrap">
          <Input flex={1} minW="160px" placeholder={t("dashboard.search")} value={search} onChange={(e) => setSearch(e.target.value)} />
          <NativeSelect.Root size="sm" width="140px">
            <NativeSelect.Field value={filterStack} onChange={(e) => setFilterStack(e.target.value)}>
              <option value="all">{t("dashboard.filterAll")}</option>
              {techStacks.map((s) => <option key={s} value={s}>{s}</option>)}
            </NativeSelect.Field>
          </NativeSelect.Root>
          <NativeSelect.Root size="sm" width="110px">
            <NativeSelect.Field value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}>
              <option value="all">{t("dashboard.filterAll")}</option>
              <option value="zombie">{t("dashboard.zombie")}</option>
              <option value="active">{t("dashboard.filterActive")}</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
          <NativeSelect.Root size="sm" width="140px">
            <NativeSelect.Field value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
              <option value="size">{t("dashboard.sortBySize")}</option>
              <option value="time">{t("dashboard.sortByTime")}</option>
              <option value="stack">{t("dashboard.sortByStack")}</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Flex>

        <Flex gap={2} align="center">
          <Button size="xs" variant="outline" onClick={allSelected ? onDeselectAll : onSelectAll}>
            {allSelected ? t("dashboard.deselectAll") : t("dashboard.selectAll")}
          </Button>
          <Box fontSize="xs" color="fg.muted">{filtered.length} {t("dashboard.items")}</Box>
        </Flex>

        {/* Scrollable list only, excluding controls above */}
        <Box flex={1} minH={0}>
          <ScrollArea.Root height="100%">
            <ScrollArea.Viewport style={{ paddingBottom: "64px" }}>
              {listContent}
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar>
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </Box>
      </Flex>
    )
  }

  return (
    <VStack gap={3} align="stretch">
      <Flex gap={2} wrap="wrap">
        <Input flex={1} minW="160px" placeholder={t("dashboard.search")} value={search} onChange={(e) => setSearch(e.target.value)} />
        <NativeSelect.Root size="sm" width="140px">
          <NativeSelect.Field value={filterStack} onChange={(e) => setFilterStack(e.target.value)}>
            <option value="all">{t("dashboard.filterAll")}</option>
            {techStacks.map((s) => <option key={s} value={s}>{s}</option>)}
          </NativeSelect.Field>
        </NativeSelect.Root>
        <NativeSelect.Root size="sm" width="110px">
          <NativeSelect.Field value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}>
            <option value="all">{t("dashboard.filterAll")}</option>
            <option value="zombie">{t("dashboard.zombie")}</option>
            <option value="active">{t("dashboard.filterActive")}</option>
          </NativeSelect.Field>
        </NativeSelect.Root>
        <NativeSelect.Root size="sm" width="140px">
          <NativeSelect.Field value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="size">{t("dashboard.sortBySize")}</option>
            <option value="time">{t("dashboard.sortByTime")}</option>
            <option value="stack">{t("dashboard.sortByStack")}</option>
          </NativeSelect.Field>
        </NativeSelect.Root>
      </Flex>

      <Flex gap={2} align="center">
        <Button size="xs" variant="outline" onClick={allSelected ? onDeselectAll : onSelectAll}>
          {allSelected ? t("dashboard.deselectAll") : t("dashboard.selectAll")}
        </Button>
        <Box fontSize="xs" color="fg.muted">{filtered.length} {t("dashboard.items")}</Box>
      </Flex>

      <ScrollArea.Root maxH="480px">
        <ScrollArea.Viewport>{listContent}</ScrollArea.Viewport>
        <ScrollArea.Scrollbar>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </VStack>
  )
}
