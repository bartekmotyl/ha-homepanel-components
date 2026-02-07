import { memo, useContext, useRef, useCallback } from "react"
import type { LovelaceCardConfig } from "custom-card-helpers"
import type { CardProps } from "../utils/registerCard"
import { lookupEntityInState } from "../utils/widgetUtils"
import { HomeAssistantContext } from "../utils/homeAssistantContext"

interface SimpleCoverCardConfig extends LovelaceCardConfig {
  title?: string
  entity: string
  showStatus?: boolean
}

const LONG_PRESS_THRESHOLD_MS = 400

const SimpleCoverCardMemo = memo(SimpleCoverCardView)

export function SimpleCoverCard({ config }: CardProps) {
  const hass = useContext(HomeAssistantContext)
  const configTyped = config as SimpleCoverCardConfig | undefined

  const entity = lookupEntityInState(hass, configTyped?.entity)
  const title = configTyped?.title ?? entity?.attributes.friendly_name ?? ""
  const position = entity?.attributes.current_position as number | undefined
  const showStatus = configTyped?.showStatus ?? false

  const handleOpenCover = useCallback(() => {
    if (!hass || !configTyped?.entity) return
    hass.callService("cover", "open_cover", { entity_id: configTyped.entity })
  }, [hass, configTyped?.entity])

  const handleCloseCover = useCallback(() => {
    if (!hass || !configTyped?.entity) return
    hass.callService("cover", "close_cover", { entity_id: configTyped.entity })
  }, [hass, configTyped?.entity])

  const handleStopCover = useCallback(() => {
    if (!hass || !configTyped?.entity) return
    hass.callService("cover", "stop_cover", { entity_id: configTyped.entity })
  }, [hass, configTyped?.entity])

  return (
    <SimpleCoverCardMemo
      title={title}
      position={position}
      showStatus={showStatus}
      onOpen={handleOpenCover}
      onClose={handleCloseCover}
      onStop={handleStopCover}
    />
  )
}

type SimpleCoverCardViewProps = {
  title: string
  position: number | undefined
  showStatus: boolean
  onOpen: () => void
  onClose: () => void
  onStop: () => void
}

function SimpleCoverCardView(props: SimpleCoverCardViewProps) {
  const upPressStart = useRef<number | null>(null)
  const downPressStart = useRef<number | null>(null)

  const handleUpPressStart = useCallback(() => {
    upPressStart.current = Date.now()
  }, [])

  const handleUpPressEnd = useCallback(() => {
    if (upPressStart.current === null) return
    const elapsed = Date.now() - upPressStart.current
    upPressStart.current = null

    if (elapsed >= LONG_PRESS_THRESHOLD_MS) {
      props.onOpen()
    } else {
      props.onStop()
    }
  }, [props.onOpen, props.onStop])

  const handleDownPressStart = useCallback(() => {
    downPressStart.current = Date.now()
  }, [])

  const handleDownPressEnd = useCallback(() => {
    if (downPressStart.current === null) return
    const elapsed = Date.now() - downPressStart.current
    downPressStart.current = null

    if (elapsed >= LONG_PRESS_THRESHOLD_MS) {
      props.onClose()
    } else {
      props.onStop()
    }
  }, [props.onClose, props.onStop])

  const handleCancel = useCallback(() => {
    upPressStart.current = null
    downPressStart.current = null
  }, [])

  const preventContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  // Invert: 100% position (fully open) = 0% fill, 0% position (fully closed) = 100% fill
  const coverPercent = 100 - (props.position ?? 0)

  return (
    <div className="w-48 h-32 p-3 flex flex-col bg-gray-600">
      {/* Title */}
      {props.title && (
        <div
          className="text-m text-center font-bold"
          style={{
            textShadow: "0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.15)",
          }}
        >
          {props.title}
        </div>
      )}

      {/* Buttons container */}
      <div className="flex-1 flex items-center justify-center gap-3">
        {/* Down button */}
        <button
          className="w-14 h-14 flex items-center justify-center cursor-pointer select-none touch-manipulation border-2 border-white/50 rounded-lg bg-transparent active:bg-white/20 transition-colors"
          onMouseDown={handleDownPressStart}
          onMouseUp={handleDownPressEnd}
          onMouseLeave={handleCancel}
          onTouchStart={handleDownPressStart}
          onTouchEnd={handleDownPressEnd}
          onTouchCancel={handleCancel}
          onContextMenu={preventContextMenu}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <div className="text-white">
            {/* @ts-expect-error: Allow custom web component */}
            <ha-icon
              style={{ "--mdc-icon-size": "3rem" }}
              icon="mdi:arrow-down-bold"
            />
          </div>
        </button>

        {/* Vertical status bar (optional) */}
        {props.showStatus && (
          <div
            className="w-2 h-14 bg-black/30 relative overflow-hidden rounded-sm"
            style={{
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 bg-white/80 transition-all duration-300 rounded-sm"
              style={{ height: `${coverPercent}%` }}
            />
          </div>
        )}

        {/* Up button */}
        <button
          className="w-14 h-14 flex items-center justify-center cursor-pointer select-none touch-manipulation border-2 border-white/50 rounded-lg bg-transparent active:bg-white/20 transition-colors"
          onMouseDown={handleUpPressStart}
          onMouseUp={handleUpPressEnd}
          onMouseLeave={handleCancel}
          onTouchStart={handleUpPressStart}
          onTouchEnd={handleUpPressEnd}
          onTouchCancel={handleCancel}
          onContextMenu={preventContextMenu}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <div className="text-white">
            {/* @ts-expect-error: Allow custom web component */}
            <ha-icon
              style={{ "--mdc-icon-size": "3rem" }}
              icon="mdi:arrow-up-bold"
            />
          </div>
        </button>
      </div>
    </div>
  )
}
