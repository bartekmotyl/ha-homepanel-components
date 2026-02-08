import registerCard from "./utils/registerCard"
import styles from "./App.css?inline"
import { IndicatorWidgetCard } from "./cards/IndicatorWidgetCard"
import { FlexContainerCard } from "./cards/FlexContainerCard"
import { TabsCard } from "./cards/TabsCard"
import { FlexRowContainerCard } from "./cards/FlexRowContainerCard"
import { SimpleCoverCard } from "./cards/SimpleCoverCard"
import { TimerWidgetCard } from "./cards/TimerWidgetCard"
import { ClockWidgetCard } from "./cards/ClockWidgetCard"

// function loadCSS(url: string) {
//   const link = document.createElement("link")
//   link.type = "text/css"
//   link.rel = "stylesheet"
//   link.href = url
//   document.head.appendChild(link)
// }

function loadDirectCSS(styles: string) {
  const style = document.createElement("style")
  style.textContent = styles
  document.head.appendChild(style)
}

loadDirectCSS(styles)

registerCard("ha-homepanel-indicator-widget", IndicatorWidgetCard)
registerCard("ha-homepanel-flex-container", FlexContainerCard)
registerCard("ha-homepanel-flex-row-container", FlexRowContainerCard)
registerCard("ha-homepanel-tabs", TabsCard)
registerCard("ha-homepanel-simple-cover", SimpleCoverCard)
registerCard("ha-homepanel-timer-widget", TimerWidgetCard)
registerCard("ha-homepanel-clock", ClockWidgetCard)
