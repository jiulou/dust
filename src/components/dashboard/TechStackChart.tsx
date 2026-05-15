import { Box, Flex, Text, VStack } from "@chakra-ui/react"
import type { TechStackBreakdown } from "../../types/scan"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const COLORS = ["#319795", "#3182ce", "#dd6b20", "#d53f8c", "#38a169", "#805ad5", "#e53e3e"]

interface TechStackChartProps {
  data: TechStackBreakdown[]
}

export function TechStackChart({ data }: TechStackChartProps) {
  if (!data.length) return null

  const total = data.reduce((s, d) => s + d.total_size, 0)

  return (
    <Flex gap={6} align="center">
      <Box w="180px" h="180px">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="total_size"
              nameKey="tech_stack"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              strokeWidth={0}
            >
              {data.map((d, i) => (
                <Cell key={d.tech_stack} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <VStack gap={2} align="start">
        {data.map((d, i) => (
          <Flex key={d.tech_stack} gap={2} align="center" fontSize="sm">
            <Box w={3} h={3} borderRadius="full" bg={COLORS[i % COLORS.length]} />
            <Text>{d.tech_stack}</Text>
            <Text color="fg.muted">
              {formatBytes(d.total_size)} ({((d.total_size / total) * 100).toFixed(0)}%)
            </Text>
          </Flex>
        ))}
      </VStack>
    </Flex>
  )
}

function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"]
  let size = bytes
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit++
  }
  return `${unit === 0 ? size : size.toFixed(1)} ${units[unit]}`
}
