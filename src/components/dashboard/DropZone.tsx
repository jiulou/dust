import { Box, Flex, Text } from "@chakra-ui/react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { open } from "@tauri-apps/plugin-dialog"
import { useTranslation } from "react-i18next"
import { useEffect, useRef, useState } from "react"
import { FiFolderPlus } from "react-icons/fi"

interface DropZoneProps {
  onAdd: (path: string) => void
}

export function DropZone({ onAdd }: DropZoneProps) {
  const { t } = useTranslation()
  const [dragging, setDragging] = useState(false)
  const dragCount = useRef(0)

  useEffect(() => {
    const win = getCurrentWindow()
    const unlisten = win.onDragDropEvent((event) => {
      if (event.payload.type === "enter" || event.payload.type === "over") {
        dragCount.current++
        setDragging(true)
      } else if (event.payload.type === "leave") {
        dragCount.current = Math.max(0, dragCount.current - 1)
        if (dragCount.current === 0) setDragging(false)
      } else if (event.payload.type === "drop") {
        dragCount.current = 0
        setDragging(false)
        event.payload.paths.forEach((p) => onAdd(p))
      }
    })
    return () => { unlisten.then((fn) => fn()) }
  }, [onAdd])

  const handleClick = async () => {
    const dirs = await open({ directory: true, multiple: true })
    if (dirs) {
      ;(Array.isArray(dirs) ? dirs : [dirs]).forEach((d) => onAdd(d))
    }
  }

  return (
    <Box
      borderWidth="2px"
      borderStyle="dashed"
      borderColor={dragging ? "brand.solid" : "border"}
      borderRadius="xl"
      bg={dragging ? "bg.subtle" : "bg.subtle"}
      py={10}
      px={6}
      cursor="pointer"
      onClick={handleClick}
      transition="all 0.15s"
      _hover={{ borderColor: "brand.solid", bg: "bg.subtle" }}
    >
      <Flex direction="column" align="center" gap={3}>
        <Box fontSize="3xl" color={dragging ? "brand.solid" : "fg.muted"}>
          <FiFolderPlus />
        </Box>
        <Text fontWeight="medium" fontSize="sm" color={dragging ? "brand.fg" : "fg.muted"}>
          {t("dashboard.dropHint")}
        </Text>
        <Text fontSize="xs" color="fg.muted">
          {t("dashboard.dropSub")}
        </Text>
      </Flex>
    </Box>
  )
}
