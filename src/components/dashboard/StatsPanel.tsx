import { Flex, Stat } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import type { ScanSummary } from "../../types/scan"

interface StatsPanelProps {
  summary?: ScanSummary
  zombieCount?: number
}

export function StatsPanel({ summary, zombieCount }: StatsPanelProps) {
  const { t } = useTranslation()

  return (
    <Flex gap={4} wrap="wrap">
      {summary && (
        <>
          <Stat.Root textAlign="center">
            <Stat.Label>{t("dashboard.totalProjects")}</Stat.Label>
            <Stat.ValueText>{summary.total_projects}</Stat.ValueText>
          </Stat.Root>
          <Stat.Root textAlign="center">
            <Stat.Label>{t("dashboard.totalSize")}</Stat.Label>
            <Stat.ValueText>{formatBytes(summary.total_size)}</Stat.ValueText>
          </Stat.Root>
          <Stat.Root textAlign="center">
            <Stat.Label>{t("dashboard.techStacks")}</Stat.Label>
            <Stat.ValueText>{summary.tech_stacks.length}</Stat.ValueText>
          </Stat.Root>
        </>
      )}
      {zombieCount !== undefined && (
        <Stat.Root textAlign="center">
          <Stat.Label color="red.500">{t("dashboard.zombie")}</Stat.Label>
          <Stat.ValueText color="red.500">{zombieCount}</Stat.ValueText>
        </Stat.Root>
      )}
    </Flex>
  )
}

function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"]
  let size = bytes, unit = 0
  while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit++ }
  return `${unit === 0 ? size : size.toFixed(1)} ${units[unit]}`
}
