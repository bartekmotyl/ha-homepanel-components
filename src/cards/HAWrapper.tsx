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
      // we set hass as it is now, but do not include it as dependency in useEffect
      // there is a separate useEffects responsible for updating hass on the child card
      control.hass = hass
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current!.childNodes.forEach((child) => {
        ;(child as LovelaceCard).hass = hass
      })
    }
  }, [hass, containerRef])

  return <div ref={containerRef} className="w-fit h-fit"></div>
}
