import { HStack, IconButton } from "@chakra-ui/react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { useEffect, useState } from "react"
import { FiMinus, FiX } from "react-icons/fi"
import { LuMaximize2, LuMinimize2 } from "react-icons/lu"
import { MacTrafficLights } from "./MacTrafficLights"

const win = getCurrentWindow()

export const isMac = navigator.platform.startsWith("Mac")

export function MacSide() {
  if (!isMac) return null
  return <MacTrafficLights />
}

export function WindowControls() {
  if (isMac) return null

  return <DesktopControls />
}

function DesktopControls() {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    win.isMaximized().then(setMaximized).catch(() => {})

    const unlisten = win.onResized(() => {
      win.isMaximized().then(setMaximized).catch(() => {})
    })

    return () => {
      unlisten.then((fn) => fn())
    }
  }, [])

  return (
    <HStack gap={1}>
      <IconButton
        aria-label="Minimize"
        variant="ghost"
        size="sm"
        onClick={() => win.minimize()}
      >
        <FiMinus />
      </IconButton>
      <IconButton
        aria-label={maximized ? "Restore" : "Maximize"}
        variant="ghost"
        size="sm"
        onClick={() => win.toggleMaximize()}
      >
        {maximized ? <LuMinimize2 /> : <LuMaximize2 />}
      </IconButton>
      <IconButton
        aria-label="Close"
        variant="ghost"
        size="sm"
        _hover={{ colorPalette: "red" }}
        onClick={() => win.close()}
      >
        <FiX />
      </IconButton>
    </HStack>
  )
}
