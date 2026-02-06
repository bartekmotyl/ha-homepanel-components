import type { HomeAssistant } from "custom-card-helpers"
import * as nunjucks from "nunjucks"
import { theme } from "../config"

export function lookupEntityInState(
  hass: HomeAssistant | undefined,
  entityId: string | undefined
) {
  if (!hass || !entityId) return undefined
  return hass.states?.[entityId]
}

const env = new nunjucks.Environment(null, { autoescape: true })

// Register findInNumberRange as a Nunjucks filter with alias 'nr'
env.addFilter('nr', function (value: unknown, spec: string) {
  return findInNumberRange(spec, String(value))
})

export function evaluateExpression(expr: string, value: string, data: object, hass: HomeAssistant | undefined) {
  return env.renderString(expr, { v: value, hass: hass, ...data })
}

export function evaluateTemplate(template: string | undefined, data: object) {
  return env.renderString(template ?? '', { ...data })
}

export function resolveColor(color: string) {
  return theme.namedColors[color as keyof typeof theme.namedColors] ?? color
}


export function findInNumberRange(spec: string, value: string): string | undefined {
  // Extract default value if present (using ?? syntax)
  const parts = spec.split("??")
  const rangeSpec = parts[0]
  const defaultValue = parts[1]?.trim()

  function parse(spec: string) {
    return spec.split(";").map((part) => {
      const [rangeStr, value] = part.split(":").map((s) => s.trim())
      const range = rangeStr === "*" ? null : Number(rangeStr)
      return {
        range: range,
        value: value,
      }
    })
  }

  const ranges = parse(rangeSpec)

  const val = Number(value)
  if (value === undefined || value === null || isNaN(val)) {
    return defaultValue
  }
  for (const range of ranges) {
    if (range.range === null || val < range.range) {
      return range.value
    }
  }
  return undefined
}