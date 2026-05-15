import { Badge, Box, Card, Flex, HStack, Text } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import type { ScanResult } from "../../types/scan"
import { SiDotnet, SiGo, SiNodedotjs, SiPython, SiRust, SiRuby, SiPhp, SiSwift, SiHaskell, SiElixir, SiElm, SiDeno } from "react-icons/si"
import { TbBrandFlutter } from "react-icons/tb"
import { FaJava } from "react-icons/fa"

const techIcons: Record<string, React.ElementType> = {
  "Node.js": SiNodedotjs,
  Rust: SiRust,
  Go: SiGo,
  Flutter: TbBrandFlutter,
  Python: SiPython,
  Java: FaJava,
  ".NET": SiDotnet,
  Ruby: SiRuby,
  PHP: SiPhp,
  Swift: SiSwift,
  Haskell: SiHaskell,
  Elixir: SiElixir,
  Elm: SiElm,
  Deno: SiDeno,
}

interface ResultCardProps {
  item: ScanResult
  selected: boolean
  onToggle: () => void
}

function formatTime(ts: number): string {
  const diff = Date.now() / 1000 - ts
  if (diff < 60) return "1m"
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo`
  return `${Math.floor(diff / 31536000)}y`
}

export function ResultCard({ item, selected, onToggle }: ResultCardProps) {
  const { t } = useTranslation()
  const Icon = techIcons[item.tech_stack]

  return (
    <Card.Root
      borderColor={selected ? "brand.solid" : undefined}
      cursor="pointer"
      onClick={onToggle}
      opacity={item.is_zombie ? 0.8 : 1}
    >
      <Card.Body py={3} px={4}>
        <Flex align="center" gap={3}>
          <Box
            w={2}
            h={2}
            borderRadius="full"
            bg={selected ? "brand.solid" : "transparent"}
            borderWidth={selected ? 0 : 1}
            borderColor="border"
          />

          <Box color="fg.muted" fontSize="lg">
            {Icon && <Icon />}
          </Box>

          <Box flex={1} minW={0}>
            <Text fontWeight="medium" fontSize="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
              {item.path}
            </Text>
            <Text fontSize="xs" color="fg.muted">
              {item.tech_stack} · {item.target_dir} · {formatTime(item.last_modified)}
            </Text>
          </Box>

          <HStack gap={2}>
            {item.is_zombie && (
              <Badge colorPalette="red" size="xs">
                {t("dashboard.zombie")}
              </Badge>
            )}
            {item.is_symlink && (
              <Badge colorPalette="yellow" size="xs">
                {t("dashboard.link")}
              </Badge>
            )}
          </HStack>

          <Text fontVariantNumeric="tabular-nums" fontSize="sm" fontWeight="medium" flexShrink={0}>
            {item.formatted_size}
          </Text>
        </Flex>
      </Card.Body>
    </Card.Root>
  )
}
