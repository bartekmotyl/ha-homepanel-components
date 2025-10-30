import { useContext, useEffect, useRef } from "react"
import { createCardElement } from "../utils/cardUtils"
import type { LovelaceCard, LovelaceCardConfig } from "custom-card-helpers"
import { HomeAssistantContext } from "../utils/homeAssistantContext"

interface HAWrapperConfig {
  card: LovelaceCardConfig
}

export function HAWrapper({ card }: HAWrapperConfig) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hass = useContext(HomeAssistantContext)

  useEffect(() => {
    const container = containerRef.current

    async function loadCard(container: HTMLDivElement) {
      const control = (await createCardElement(card)) as LovelaceCard
      container.innerHTML = ""
      container.appendChild(control)
    }
    if (container) {
      loadCard(container)
    }

    // Cleanup when component unmounts
    return () => {
      if (container) {
        container.innerHTML = ""
      }
    }
  }, [card])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current!.childNodes.forEach((child) => {
        ;(child as LovelaceCard).hass = hass
      })
    }
  }, [hass])

  return <div ref={containerRef} className="w-fit h-fit"></div>
}
