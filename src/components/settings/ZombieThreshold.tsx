import { Card, Slider, Text, VStack } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import { useSettingsStore } from "../../stores/settingsStore"

export function ZombieThreshold() {
  const { t } = useTranslation()
  const settings = useSettingsStore((s) => s.settings)
  const updateZombieThreshold = useSettingsStore((s) => s.updateZombieThreshold)

  return (
    <Card.Root>
      <Card.Header>
        <Text fontWeight="medium">{t("settings.zombieThreshold")}</Text>
      </Card.Header>
      <Card.Body>
        <VStack gap={3} align="stretch">
          <Text fontSize="sm" color="fg.muted">
            {t("settings.zombieHint")}
          </Text>
          <Slider.Root
            value={[settings.zombieThresholdDays]}
            min={1}
            max={365}
            onValueChange={(e) => updateZombieThreshold(e.value[0])}
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumb index={0} />
            </Slider.Control>
          </Slider.Root>
          <Text fontSize="sm" fontWeight="medium">{settings.zombieThresholdDays} {t("settings.days")}</Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}
