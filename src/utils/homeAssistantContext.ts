import { createContext } from "react"
import type { HomeAssistant, } from "custom-card-helpers"

export const HomeAssistantContext = createContext<HomeAssistant | undefined>(undefined)
