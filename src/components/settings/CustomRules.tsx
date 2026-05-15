import { Box, Button, Card, Flex, IconButton, Input, NativeSelect, Text, VStack } from "@chakra-ui/react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FiPlus, FiTrash2 } from "react-icons/fi"
import type { ScanRule } from "../../types/scan"

interface CustomRulesProps {
  rules: ScanRule[]
  onAdd: (rule: ScanRule) => void
  onRemove: (index: number) => void
}

const techStacks: { value: ScanRule["tech_stack"]; label: string }[] = [
  { value: "node_js", label: "Node.js" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "flutter", label: "Flutter" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "dot_net", label: ".NET" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "haskell", label: "Haskell" },
  { value: "elixir", label: "Elixir" },
  { value: "elm", label: "Elm" },
  { value: "deno", label: "Deno" },
]

export function CustomRules({ rules, onAdd, onRemove }: CustomRulesProps) {
  const { t } = useTranslation()
  const [dir, setDir] = useState("")
  const [anchor, setAnchor] = useState("")
  const [stack, setStack] = useState("node_js")

  const handleAdd = () => {
    if (!dir.trim() || !anchor.trim()) return
    onAdd({
      target_dir: dir.trim(),
      anchor_files: [anchor.trim()],
      tech_stack: stack as ScanRule["tech_stack"],
    })
    setDir("")
    setAnchor("")
    setStack("node_js")
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontWeight="medium">{t("settings.customRules")}</Text>
      </Card.Header>
      <Card.Body>
        <VStack gap={4} align="stretch">
          {rules.map((rule, i) => (
            <Flex key={rule.target_dir + rule.anchor_files.join(",") + rule.tech_stack} gap={2} align="center" fontSize="sm">
              <Box flex={1} px={3} py={1.5} bg="bg.subtle" borderRadius="md">
                {rule.target_dir} → {rule.anchor_files.join(", ")}
              </Box>
              <Box px={2} py={1} borderRadius="md" fontSize="xs" bg="brand.muted">{rule.tech_stack}</Box>
              <IconButton aria-label="Remove" size="xs" variant="ghost" colorPalette="red" onClick={() => onRemove(i)}>
                <FiTrash2 />
              </IconButton>
            </Flex>
          ))}
          <Flex gap={2} wrap="wrap">
            <Input
              size="sm"
              flex={1}
              minW="120px"
              placeholder={t("settings.targetDir")}
              value={dir}
              onChange={(e) => setDir(e.target.value)}
            />
            <Input
              size="sm"
              flex={1}
              minW="120px"
              placeholder={t("settings.anchorFile")}
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
            />
            <NativeSelect.Root size="sm" width="130px">
              <NativeSelect.Field value={stack} onChange={(e) => setStack(e.target.value)}>
                {techStacks.map((ts) => (
                  <option key={ts.value} value={ts.value}>{ts.label}</option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
            <Button size="sm" onClick={handleAdd} disabled={!dir.trim() || !anchor.trim()}>
              <FiPlus />
            </Button>
          </Flex>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}
