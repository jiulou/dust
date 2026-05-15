import { Box, Card, HStack, Text } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import { useSettingsStore } from "../../stores/settingsStore"

export function LanguageSettings() {
  const { t, i18n } = useTranslation()
  const updateLanguage = useSettingsStore((s) => s.updateLanguage)

  const currentLang = i18n.language?.startsWith("zh") ? "zh" : "en"

  const languages = [
    { code: "zh" as const, label: "中文" },
    { code: "en" as const, label: "English" },
  ]

  const handleChange = (code: "en" | "zh") => {
    updateLanguage(code)
    i18n.changeLanguage(code)
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontWeight="medium">{t("settings.language")}</Text>
      </Card.Header>
      <Card.Body>
        <HStack gap={2}>
          {languages.map((lang) => (
            <Box
              key={lang.code}
              px={4}
              py={2}
              borderRadius="md"
              fontSize="sm"
              cursor="pointer"
              bg={currentLang === lang.code ? "brand.muted" : "bg.subtle"}
              color={currentLang === lang.code ? "brand.fg" : "fg.muted"}
              onClick={() => handleChange(lang.code)}
            >
              {lang.label}
            </Box>
          ))}
        </HStack>
      </Card.Body>
    </Card.Root>
  )
}
