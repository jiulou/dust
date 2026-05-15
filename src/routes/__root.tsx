import { Box } from "@chakra-ui/react"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import { Navbar } from "../components/layout/Navbar"

export const Route = createRootRoute({
  component: () => (
    <Box display="flex" flexDirection="column" height="100%" bg="bg">
      <Navbar />
      <Box flex={1} minH={0} px={6} py={8} overflowY="auto">
        <Outlet />
      </Box>
    </Box>
  ),
})
