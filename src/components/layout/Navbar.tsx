import { Box, Flex, HStack, IconButton } from "@chakra-ui/react"
import { useState } from "react"
import { FiMoon, FiSettings, FiSun } from "react-icons/fi"
import { useColorMode } from "../../hooks/useColorMode"
import { MacSide, WindowControls } from "./WindowControls"
import { SettingsDrawer } from "./SettingsDrawer"

export function Navbar() {
  const { effective, toggleColorMode } = useColorMode()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <Box
        as="header"
        borderBottomWidth="1px"
        bg="bg.panel"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Flex
          data-tauri-drag-region="deep"
          px={2}
          h={12}
          align="center"
          userSelect="none"
          gap={2}
        >
          <MacSide />

          <Flex flex={1} />

          <HStack gap={1}>
            <IconButton
              aria-label="Toggle color mode"
              variant="ghost"
              size="sm"
              onClick={toggleColorMode}
            >
              {effective === "dark" ? <FiSun /> : <FiMoon />}
            </IconButton>
            <IconButton
              aria-label="Settings"
              variant="ghost"
              size="sm"
              onClick={() => setDrawerOpen(true)}
            >
              <FiSettings />
            </IconButton>
            <WindowControls />
          </HStack>
        </Flex>
      </Box>
      <SettingsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
