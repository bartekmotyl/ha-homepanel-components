import type { LovelaceCardConfig } from "custom-card-helpers"
import type { CardProps } from "../utils/registerCard"
import { useState } from "react"
import { HAWrapper } from "./HAWrapper"

type TabConfig = {
  title: string
  cards: LovelaceCardConfig[]
}

interface TabsCardConfig extends LovelaceCardConfig {
  pages: TabConfig[]
}

export function TabsCard({ config }: CardProps) {
  const configTyped = config as TabsCardConfig | undefined
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  return (
    <div
      className="flex flex-col bg-gray-800 "
      style={{ width: configTyped?.width, height: configTyped?.height }}
    >
      <div className="flex flex-row w-full pb-1">
        {configTyped?.pages.map((tab, index) => (
          <div
            className={`p-2 ${
              activeTabIndex === index
                ? " border-b-green-700"
                : "border-b-transparent"
            } cursor-pointer uppercase transition-colors duration-700 border-b-2 `}
            onClick={() => setActiveTabIndex(index)}
          >
            {tab.title}
          </div>
        ))}
      </div>
      {configTyped?.pages.map((tab, index) => (
        <div
          className="w-full flex-1 flex flex-row flex-wrap content-start gap-1 overflow-y-auto p-1"
          style={{ display: index === activeTabIndex ? "flex" : "none" }}
        >
          {tab.cards.map((card, cardIndex) => (
            <HAWrapper key={cardIndex} card={card}></HAWrapper>
          ))}
        </div>
      ))}
    </div>
  )
}
