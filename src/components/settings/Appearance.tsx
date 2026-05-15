import { Box, Card, Flex, HStack, Text, VStack } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import { useColorMode } from "../../hooks/useColorMode"
import { useSettingsStore } from "../../stores/settingsStore"
import type { ThemeColor } from "../../types/settings"

const themeColors: ThemeColor[] = ["teal", "blue", "purple", "green", "orange", "red", "pink", "cyan"]

export function Appearance() {
  const { t } = useTranslation()
  const settings = useSettingsStore((s) => s.settings)
  const updateThemeColor = useSettingsStore((s) => s.updateThemeColor)
  const updateColorMode = useSettingsStore((s) => s.updateColorMode)
  const { colorMode, setColorMode } = useColorMode()

  return (
    <Card.Root>
      <Card.Header>
        <Text fontWeight="medium">{t("settings.appearance")}</Text>
      </Card.Header>
      <Card.Body>
        <VStack gap={5} align="stretch">
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>{t("settings.themeColor")}</Text>
            <Flex gap={2} wrap="wrap">
              {themeColors.map((c) => (
                <Box
                  key={c}
                  w={7}
                  h={7}
                  borderRadius="full"
                  bg={`${c}.500`}
                  cursor="pointer"
                  outline={settings.themeColor === c ? "3px solid" : "none"}
                  outlineColor="brand.solid"
                  onClick={() => updateThemeColor(c)}
                />
              ))}
            </Flex>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>{t("settings.colorMode")}</Text>
            <HStack gap={2}>
              {(["dark", "light", "system"] as const).map((mode) => (
                <Box
                  key={mode}
                  px={4}
                  py={2}
                  borderRadius="md"
                  fontSize="sm"
                  cursor="pointer"
                  bg={colorMode === mode ? "brand.muted" : "bg.subtle"}
                  color={colorMode === mode ? "brand.fg" : "fg.muted"}
                  onClick={() => {
                    setColorMode(mode)
                    updateColorMode(mode)
                  }}
                >
                  {t(`settings.${mode}`)}
                </Box>
              ))}
            </HStack>
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}
