import { Button, Card, Flex, IconButton, Input, Text, VStack } from "@chakra-ui/react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FiPlus, FiX } from "react-icons/fi"

interface WhitelistProps {
  items: string[]
  onAdd: (path: string) => void
  onRemove: (index: number) => void
}

export function Whitelist({ items, onAdd, onRemove }: WhitelistProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState("")

  const handleAdd = () => {
    const trimmed = value.trim()
    if (trimmed) {
      onAdd(trimmed)
      setValue("")
    }
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontWeight="medium">{t("settings.whitelist")}</Text>
      </Card.Header>
      <Card.Body>
        <VStack gap={3} align="stretch">
          {items.map((item, i) => (
            <Flex key={item} gap={2} align="center" fontSize="sm">
              <Flex flex={1} px={3} py={1.5} bg="bg.subtle" borderRadius="md">
                {item}
              </Flex>
              <IconButton aria-label="Remove" size="xs" variant="ghost" colorPalette="red" onClick={() => onRemove(i)}>
                <FiX />
              </IconButton>
            </Flex>
          ))}
          <Flex gap={2}>
            <Input
              size="sm"
              placeholder="/path/to/skip"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button size="sm" onClick={handleAdd} disabled={!value.trim()}>
              <FiPlus />
            </Button>
          </Flex>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}
