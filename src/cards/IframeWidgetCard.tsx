import { useEffect, useRef, useState } from "react"
import type { LovelaceCardConfig } from "custom-card-helpers"
import type { CardProps } from "../utils/registerCard"

interface IframeWidgetCardConfig extends LovelaceCardConfig {
  url: string
  width?: string
  height?: string
  refreshInterval?: number // auto-reload interval in seconds
}

export function IframeWidgetCard({ config }: CardProps) {
  const configTyped = config as IframeWidgetCardConfig | undefined
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!configTyped?.refreshInterval) return

    const interval = setInterval(() => {
      setReloadKey((k) => k + 1)
    }, configTyped.refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [configTyped?.refreshInterval])

  if (!configTyped?.url) return <></>

  return (
    <iframe
      ref={iframeRef}
      key={reloadKey}
      src={configTyped.url}
      className="border-0"
      style={{
        width: configTyped.width ?? "100%",
        height: configTyped.height ?? "100%",
      }}
    />
  )
}
