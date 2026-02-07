import { memo, useRef, useCallback, useState, useEffect } from "react"
import type { LovelaceCardConfig } from "custom-card-helpers"
import type { CardProps } from "../utils/registerCard"

interface TimerWidgetCardConfig extends LovelaceCardConfig {
  title?: string
  duration: number // duration in seconds
  sound?: string // path to sound file, e.g., "/local/timer-alarm.ogg"
}

type TimerState = "idle" | "running" | "overtime"

interface TimerData {
  state: TimerState
  startedAt: number | null // timestamp when timer started
  duration: number // configured duration in seconds
  soundPlaying: boolean // whether sound is currently in repeat cycle
}

const LONG_PRESS_THRESHOLD_MS = 400
const SOUND_REPEAT_INTERVAL_MS = 10000

// Module-level storage to persist timer state across re-renders
const timerStorage = new Map<string, TimerData>()
const soundIntervals = new Map<string, ReturnType<typeof setInterval>>()
const audioElements = new Map<string, HTMLAudioElement>()

function getTimerKey(config: TimerWidgetCardConfig | undefined): string {
  // Create a unique key based on config
  return `timer-${config?.title ?? "default"}-${config?.duration ?? 0}`
}

function playSound(key: string, soundPath: string) {
  // Get or create audio element
  let audio = audioElements.get(key)
  if (!audio) {
    audio = new Audio(soundPath)
    audioElements.set(key, audio)
  }
  audio.currentTime = 0
  audio.play().catch(() => {
    // Ignore autoplay errors (user interaction required)
  })
}

function startSoundLoop(key: string, soundPath: string) {
  // Stop any existing loop
  stopSoundLoop(key)

  // Play immediately
  playSound(key, soundPath)

  // Set up repeat interval
  const interval = setInterval(() => {
    playSound(key, soundPath)
  }, SOUND_REPEAT_INTERVAL_MS)
  soundIntervals.set(key, interval)
}

function stopSoundLoop(key: string) {
  const interval = soundIntervals.get(key)
  if (interval) {
    clearInterval(interval)
    soundIntervals.delete(key)
  }
  const audio = audioElements.get(key)
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
}

function getOrCreateTimerData(
  config: TimerWidgetCardConfig | undefined,
): TimerData {
  const key = getTimerKey(config)
  if (!timerStorage.has(key)) {
    timerStorage.set(key, {
      state: "idle",
      startedAt: null,
      duration: config?.duration ?? 60,
      soundPlaying: false,
    })
  }
  return timerStorage.get(key)!
}

const TimerWidgetCardMemo = memo(TimerWidgetCardView)

export function TimerWidgetCard({ config }: CardProps) {
  const configTyped = config as TimerWidgetCardConfig | undefined
  const title = configTyped?.title ?? ""
  const duration = configTyped?.duration ?? 60
  const sound = configTyped?.sound

  // Force re-render trigger
  const [, setTick] = useState(0)

  const timerData = getOrCreateTimerData(configTyped)
  const timerKey = getTimerKey(configTyped)

  // Update duration if config changes
  useEffect(() => {
    timerData.duration = duration
  }, [duration, timerData])

  // Interval for updating display
  useEffect(() => {
    if (timerData.state === "idle") return

    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timerData.state])

  const handleStart = useCallback(() => {
    timerData.state = "running"
    timerData.startedAt = Date.now()
    timerData.soundPlaying = false
    setTick((t) => t + 1)
  }, [timerData])

  const handleReset = useCallback(() => {
    timerData.state = "idle"
    timerData.startedAt = null
    timerData.soundPlaying = false
    stopSoundLoop(timerKey)
    setTick((t) => t + 1)
  }, [timerData, timerKey])

  // Calculate current display time
  let displaySeconds = duration
  let currentState: TimerState = timerData.state

  if (timerData.state !== "idle" && timerData.startedAt !== null) {
    const elapsed = Math.floor((Date.now() - timerData.startedAt) / 1000)
    const remaining = duration - elapsed

    if (remaining > 0) {
      displaySeconds = remaining
      currentState = "running"
    } else {
      displaySeconds = Math.abs(remaining)
      currentState = "overtime"
      // Update stored state if transitioned to overtime
      if (timerData.state !== "overtime") {
        timerData.state = "overtime"
      }
      // Start sound when entering overtime
      if (!timerData.soundPlaying && sound) {
        timerData.soundPlaying = true
        startSoundLoop(timerKey, sound)
      }
    }
  }

  return (
    <TimerWidgetCardMemo
      title={title}
      displaySeconds={displaySeconds}
      timerState={currentState}
      duration={duration}
      onStart={handleStart}
      onReset={handleReset}
    />
  )
}

type TimerWidgetCardViewProps = {
  title: string
  displaySeconds: number
  timerState: TimerState
  duration: number
  onStart: () => void
  onReset: () => void
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function TimerWidgetCardView(props: TimerWidgetCardViewProps) {
  const { timerState, onStart, onReset } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTriggered = useRef(false)

  const handlePressStart = useCallback(() => {
    longPressTriggered.current = false

    // Set timeout to trigger reset immediately when threshold is reached
    longPressTimeout.current = setTimeout(() => {
      longPressTriggered.current = true
      onReset()
    }, LONG_PRESS_THRESHOLD_MS)
  }, [onReset])

  const handlePressEnd = useCallback(() => {
    // Clear the long press timeout
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current)
      longPressTimeout.current = null
    }

    // If long press already triggered, do nothing more
    if (longPressTriggered.current) {
      longPressTriggered.current = false
      return
    }

    // Short press: depends on state
    if (timerState === "idle") {
      onStart()
    } else if (timerState === "overtime") {
      onReset()
    }
    // During "running" state, short press does nothing
  }, [timerState, onStart, onReset])

  const handleCancel = useCallback(() => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current)
      longPressTimeout.current = null
    }
    longPressTriggered.current = false
  }, [])

  const preventContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  // Add touch event listeners with { passive: false } to allow preventDefault
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault() // Prevent mouse event emulation
      handlePressStart()
    }
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      handlePressEnd()
    }
    const onTouchCancel = () => {
      handleCancel()
    }

    el.addEventListener("touchstart", onTouchStart, { passive: false })
    el.addEventListener("touchend", onTouchEnd, { passive: false })
    el.addEventListener("touchcancel", onTouchCancel)

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchend", onTouchEnd)
      el.removeEventListener("touchcancel", onTouchCancel)
    }
  }, [handlePressStart, handlePressEnd, handleCancel])

  // Determine text color based on state
  let textColorClass = "text-white/70" // idle
  if (props.timerState === "running") {
    textColorClass = "text-yellow-400"
  } else if (props.timerState === "overtime") {
    textColorClass = "text-red-500"
  }

  return (
    <div
      ref={containerRef}
      className="w-32 h-32 p-3 flex flex-col bg-gray-600 cursor-pointer select-none touch-manipulation"
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handleCancel}
      onContextMenu={preventContextMenu}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Title - same style as SimpleCoverCard */}
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

      {/* Time display - centered in remaining space */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className={`text-4xl font-bold ${textColorClass}`}
          style={{
            textShadow: "0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)",
          }}
        >
          {formatTime(props.displaySeconds)}
        </div>
      </div>
    </div>
  )
}
