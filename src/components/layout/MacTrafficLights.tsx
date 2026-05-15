import { Box, HStack } from "@chakra-ui/react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { FiMinus, FiX } from "react-icons/fi"
import { LuMaximize2 } from "react-icons/lu"

const win = getCurrentWindow()

function TrafficDot({
  color,
  icon,
  onClick,
}: {
  color: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <Box
      w="12px"
      h="12px"
      borderRadius="full"
      bg={color}
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize="8px"
      lineHeight="1"
      color="transparent"
      _hover={{ color: "blackAlpha.700" }}
      cursor="pointer"
      onClick={onClick}
    >
      {icon}
    </Box>
  )
}

export function MacTrafficLights() {
  return (
    <HStack gap="8px" pl={1}>
      <TrafficDot
        color="#ff5f57"
        icon={<FiX />}
        onClick={() => win.close()}
      />
      <TrafficDot
        color="#febc2e"
        icon={<FiMinus />}
        onClick={() => win.minimize()}
      />
      <TrafficDot
        color="#28c840"
        icon={<LuMaximize2 />}
        onClick={() => win.toggleMaximize()}
      />
    </HStack>
  )
}
