import type { LovelaceCardConfig } from "custom-card-helpers"
import type { CardProps } from "../utils/registerCard"
import { HAWrapper } from "./HAWrapper"

interface FlexContainerCardConfig extends LovelaceCardConfig {
  cards: LovelaceCardConfig[]
}

export function FlexContainerCard({ config }: CardProps) {
  const configTyped = config as FlexContainerCardConfig | undefined
  return (
    <div className="flex flex-row flex-wrap w-128 h-128 border-2 border-amber-700">
      {configTyped?.cards.map((card, index) => (
        <HAWrapper key={index} card={card}></HAWrapper>
      ))}
    </div>
  )
}
