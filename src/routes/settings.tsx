import { Heading, Separator, VStack } from "@chakra-ui/react"
import { createRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Appearance } from "../components/settings/Appearance"
import { LanguageSettings } from "../components/settings/LanguageSettings"
import { CustomRules } from "../components/settings/CustomRules"
import { Whitelist } from "../components/settings/Whitelist"
import { ZombieThreshold } from "../components/settings/ZombieThreshold"
import { Route as rootRoute } from "./__root"
import { useSettingsStore } from "../stores/settingsStore"

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
})

function SettingsPage() {
  const { t } = useTranslation()
  const settings = useSettingsStore((s) => s.settings)
  const addCustomRule = useSettingsStore((s) => s.addCustomRule)
  const removeCustomRule = useSettingsStore((s) => s.removeCustomRule)
  const addWhitelist = useSettingsStore((s) => s.addWhitelist)
  const removeWhitelist = useSettingsStore((s) => s.removeWhitelist)

  return (
    <VStack gap={6} align="stretch">
      <Heading size="lg">{t("settings.title")}</Heading>

      <Appearance />
      <LanguageSettings />

      <Separator />

      <CustomRules
        rules={settings.customRules}
        onAdd={addCustomRule}
        onRemove={removeCustomRule}
      />

      <Whitelist
        items={settings.whitelist}
        onAdd={addWhitelist}
        onRemove={removeWhitelist}
      />

      <ZombieThreshold />

      <Separator />

      <VStack gap={2} align="center" py={6} color="fg.muted" fontSize="sm">
        <Heading size="sm" fontSize="md">{t("about.title")}</Heading>
        <>{t("about.description")}</>
        <>{t("about.version")}: 0.1.0</>
      </VStack>
    </VStack>
  )
}
