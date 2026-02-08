import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import type { CardProps } from "../utils/registerCard"

function formatClock(): string {
  const now = new Date()
  const h = now.getHours().toString().padStart(2, "0")
  const m = now.getMinutes().toString().padStart(2, "0")
  const s = now.getSeconds().toString().padStart(2, "0")
  return `${h}:${m}:${s}`
}

const PORTAL_ID = "ha-homepanel-clock-portal"

function getOrCreatePortalContainer(): HTMLElement {
  let container = document.getElementById(PORTAL_ID)
  if (!container) {
    container = document.createElement("div")
    container.id = PORTAL_ID
    document.body.appendChild(container)
  }
  return container
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ClockWidgetCard(_props: CardProps) {
  const [time, setTime] = useState(formatClock)
  const portalContainer = useRef(getOrCreatePortalContainer())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatClock())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return createPortal(
    <div
      className="bg-gray-600 fixed bottom-0 right-0 px-3 py-2 text-5xl font-bold  z-50 pointer-events-none"
      style={{
        textShadow: "0 1px 3px rgba(0,0,0,0.5)",
      }}
    >
      {time}
    </div>,
    portalContainer.current,
  )
}
