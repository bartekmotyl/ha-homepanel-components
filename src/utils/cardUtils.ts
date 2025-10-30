import type { LovelaceCardConfig } from "custom-card-helpers"

declare global {
  interface Window {
    loadCardHelpers?: () => Promise<{
      createCardElement: (config: LovelaceCardConfig) => Promise<HTMLElement>
    }>
  }
}

export async function createCardElement(cardConfig: LovelaceCardConfig) {
  const loadCardHelpers = window.loadCardHelpers
  if (!loadCardHelpers) throw new Error("window.loadCardHelpers is not defined")
  const helpers = await loadCardHelpers()
  const element = await helpers.createCardElement(cardConfig)
  return element
}