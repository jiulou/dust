import { Box, Button, Dialog, Flex, HStack, Text, VStack } from "@chakra-ui/react"
import { invoke } from "@tauri-apps/api/core"
import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi"

interface HarvestDialogProps {
  open: boolean
  onClose: () => void
  itemCount: number
  totalSize: string
  paths: string[]
  partitions: string[]
  onDone: () => void
}

export function HarvestDialog({ open, onClose, itemCount, totalSize, paths, partitions, onDone }: HarvestDialogProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const crossPartition = partitions.length > 1

  const handleConfirm = useCallback(async () => {
    if (crossPartition && !confirmed) {
      setConfirmed(true)
      return
    }
    setLoading(true)
    try {
      await invoke("trash_paths", { paths })
      onDone()
      onClose()
    } catch (e) {
      console.error("harvest failed", e)
    } finally {
      setLoading(false)
      setConfirmed(false)
    }
  }, [paths, crossPartition, confirmed, onDone, onClose])

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <HStack gap={2}>
              <FiTrash2 />
              <Dialog.Title>{t("harvest.title")}</Dialog.Title>
            </HStack>
          </Dialog.Header>

          <Dialog.Body>
            <VStack gap={4} align="stretch">
              <Text>{t("harvest.description", { count: itemCount, size: totalSize })}</Text>

              {crossPartition && !confirmed && (
                <Flex gap={3} p={3} bg="red.100" borderRadius="md" align="center" _dark={{ bg: "red.900" }}>
                  <Box color="red.500"><FiAlertTriangle /></Box>
                  <Text fontSize="sm" color="red.700" _dark={{ color: "red.200" }}>
                    {t("harvest.crossPartitionWarning", { list: partitions.join(", ") })}
                  </Text>
                </Flex>
              )}

              <Flex gap={3} p={3} bg="bg.subtle" borderRadius="md" align="center">
                <Box color="fg.muted"><FiAlertTriangle /></Box>
                <Text fontSize="sm" color="fg.muted">{t("harvest.recycleBin")}</Text>
              </Flex>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <Button variant="ghost" onClick={onClose} disabled={loading}>{t("harvest.cancel")}</Button>
            <Button colorPalette={crossPartition && !confirmed ? "orange" : "red"} onClick={handleConfirm} loading={loading}>
              {crossPartition && !confirmed ? t("harvest.understand") : t("harvest.confirm")}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
