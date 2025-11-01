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
    <div className="flex flex-col border border-gray-700 border-dashed">
      <div className="flex flex-row w-full pb-1">
        {configTyped?.pages.map((tab, index) => (
          <div
            className={`p-2 ${
              activeTabIndex === index ? "border-b-2 border-b-green-700" : ""
            } cursor-pointer uppercase`}
            onClick={() => setActiveTabIndex(index)}
          >
            {tab.title}
          </div>
        ))}
      </div>
      {configTyped?.pages.map((tab, index) => (
        <div
          className="w-full"
          style={{ display: index === activeTabIndex ? "block" : "none" }}
        >
          {tab.cards.map((card, cardIndex) => (
            <div key={cardIndex} className="">
              <HAWrapper card={card}></HAWrapper>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
