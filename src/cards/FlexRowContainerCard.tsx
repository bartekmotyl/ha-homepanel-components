import type { LovelaceCardConfig } from "custom-card-helpers"
import type { CardProps } from "../utils/registerCard"
import { HAWrapper } from "./HAWrapper"

interface FlexContainerCardConfig extends LovelaceCardConfig {
  cards: LovelaceCardConfig[]
}

export function FlexRowContainerCard({ config }: CardProps) {
  const configTyped = config as FlexContainerCardConfig | undefined

  return (
    <div
      className="flex flex-row items-start content-start w-full h-full gap-1 overflow-y-auto overflow-x-auto"
      style={{ width: configTyped?.width, height: configTyped?.height }}
    >
      {configTyped?.cards.map((card, index) => (
        <HAWrapper key={index} card={card}></HAWrapper>
      ))}
    </div>
  )
}
