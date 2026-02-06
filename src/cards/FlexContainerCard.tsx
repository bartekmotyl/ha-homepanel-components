import type { LovelaceCardConfig } from "custom-card-helpers"
import type { CardProps } from "../utils/registerCard"
import { HAWrapper } from "./HAWrapper"

interface FlexContainerCardConfig extends LovelaceCardConfig {
  cards: LovelaceCardConfig[]
  width?: string // CSS value e.g. '10px', '5rem'
  height?: string // CSS value e.g. '10px', '5rem'
}

export function FlexContainerCard({ config }: CardProps) {
  const configTyped = config as FlexContainerCardConfig | undefined
  const isSingleCard = configTyped?.cards?.length === 1

  return (
    <div
      className="flex flex-row flex-wrap items-start content-start w-128 h-128 gap-1 overflow-y-auto"
      style={{ width: configTyped?.width, height: configTyped?.height }}
    >
      {configTyped?.cards.map((card, index) => (
        <HAWrapper
          fullWidth={isSingleCard}
          fullHeight={isSingleCard}
          key={index}
          card={card}
        ></HAWrapper>
      ))}
    </div>
  )
}
