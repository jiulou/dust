import { Box, Button, Drawer, Flex, IconButton, Separator, Text, VStack } from "@chakra-ui/react"
import { FiDownload, FiX } from "react-icons/fi"
import { useTranslation } from "react-i18next"
import { useCallback, useEffect, useState } from "react"
import { getVersion } from "@tauri-apps/api/app"
import { check } from "@tauri-apps/plugin-updater"
import { relaunch } from "@tauri-apps/plugin-process"
import { Appearance } from "../settings/Appearance"
import { LanguageSettings } from "../settings/LanguageSettings"
import { ZombieThreshold } from "../settings/ZombieThreshold"

const SUPPORTED_LANGUAGES = [
  "Node.js", "Rust", "Go", "Flutter", "Python", "Java", ".NET",
  "Ruby", "PHP", "Swift", "Haskell", "Elixir", "Elm", "Deno",
]

interface SettingsDrawerProps {
  open: boolean
  onClose: () => void
}

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const { t } = useTranslation()
  const [appVersion, setAppVersion] = useState("")
  const [updating, setUpdating] = useState(false)
  useEffect(() => { getVersion().then(setAppVersion).catch(() => setAppVersion("?")) }, [])

  const handleUpdate = useCallback(async () => {
    setUpdating(true)
    try {
      const update = await check()
      if (update) {
        await update.downloadAndInstall()
        await relaunch()
      } else {
        alert(t("dashboard.upToDate"))
      }
    } catch (e) {
      console.error("Update failed", e)
      alert(t("dashboard.updateFailed"))
    } finally {
      setUpdating(false)
    }
  }, [])

  return (
    <Drawer.Root open={open} onOpenChange={() => onClose()} placement="end" size="md">
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Header>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Text fontWeight="semibold" fontSize="lg">{t("settings.title")}</Text>
              <IconButton aria-label="Close" variant="ghost" size="sm" onClick={onClose}>
                <FiX />
              </IconButton>
            </Box>
          </Drawer.Header>
          <Drawer.Body>
            <VStack gap={6} align="stretch">
              <Appearance />
              <LanguageSettings />
              <Separator />
              <ZombieThreshold />
              <Separator />
              <Box>
                <Text fontWeight="medium" mb={2}>{t("dashboard.supportedLangs")}</Text>
                <Flex gap={2} wrap="wrap">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <Box key={lang} px={2} py={0.5} bg="bg.subtle" borderRadius="md" fontSize="xs">
                      {lang}
                    </Box>
                  ))}
                </Flex>
              </Box>
              <VStack gap={1} align="center" py={4} color="fg.muted" fontSize="sm">
                <Text fontSize="sm">{t("about.title")}</Text>
                <Text fontSize="xs">{t("about.description")}</Text>
                <Text fontSize="xs">{t("about.version")}: {appVersion}</Text>
                <Button size="xs" variant="outline" mt={2} onClick={handleUpdate} loading={updating}>
                  <FiDownload />
                  {t("dashboard.checkUpdate")}
                </Button>
              </VStack>
            </VStack>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  )
}
