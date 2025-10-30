import { memo, useContext } from "react"
import type { LovelaceCardConfig } from "custom-card-helpers"
import type { CardProps } from "../utils/registerCard"
import {
  evaluateExpression,
  resolveColor,
  lookupEntityInState,
} from "../utils/widgetUtils"
import type { NamedColorKeys } from "../theme/standardTheme"
import { HomeAssistantContext } from "../utils/homeAssistantContext"

interface IndicatorWidgetCardConfig extends LovelaceCardConfig {
  title?: string
  titleExpr?: string
  icon?: string
  iconExpr?: string
  entity: string
  valueExpr?: string
  entityNW?: string
  entityNE?: string
  entitySW?: string
  entitySE?: string
  bgColor?: string
  bgColorExpr?: string
}

const IndicatorWidgetMemo = memo(IndicatorWidgetView)

export function IndicatorWidgetCard({ config }: CardProps) {
  const hass = useContext(HomeAssistantContext)
  const configTyped = config as IndicatorWidgetCardConfig | undefined

  const entityMain = lookupEntityInState(hass, configTyped?.entity)
  const rawValue = entityMain?.state

  const rawValueNW = lookupEntityInState(hass, configTyped?.entityNW)?.state
  const rawValueNE = lookupEntityInState(hass, configTyped?.entityNE)?.state
  const rawValueSW = lookupEntityInState(hass, configTyped?.entitySW)?.state
  const rawValueSE = lookupEntityInState(hass, configTyped?.entitySE)?.state

  let title: string =
    config?.title ?? entityMain?.attributes.friendly_name ?? ""

  if (configTyped?.titleExpr) {
    title =
      evaluateExpression(
        configTyped?.titleExpr,
        rawValue ?? "",
        { fn: entityMain?.attributes.friendly_name },
        hass
      ) ?? ""
  }

  let bgColorName: string = "Undefined" as const satisfies NamedColorKeys

  if (configTyped?.bgColor) {
    bgColorName = configTyped.bgColor
  }
  if (configTyped?.bgColorExpr) {
    bgColorName =
      evaluateExpression(configTyped.bgColorExpr, rawValue ?? "", {}, hass) ??
      ""
  }

  let value: string = rawValue ?? ""
  if (configTyped?.valueExpr) {
    value =
      evaluateExpression(configTyped?.valueExpr, rawValue ?? "", {}, hass) ?? ""
  }
  const valueNW = rawValueNW
  const valueNE = rawValueNE
  const valueSW = rawValueSW
  const valueSE = rawValueSE

  let icon = configTyped?.icon
  if (configTyped?.iconExpr) {
    icon =
      evaluateExpression(configTyped?.iconExpr, rawValue ?? "", {}, hass) ?? ""
  }
  return (
    <IndicatorWidgetMemo
      title={title}
      bgColor={resolveColor(bgColorName)}
      value={value}
      valueSW={valueSW}
      valueSE={valueSE}
      valueNW={valueNW}
      valueNE={valueNE}
      icon={icon}
    />
  )
}

type IndicatorWidgetViewProps = {
  title: string
  bgColor: string
  icon?: string
  value: string | undefined
  valueNW: string | undefined
  valueNE: string | undefined
  valueSW: string | undefined
  valueSE: string | undefined
}

function IndicatorWidgetView(props: IndicatorWidgetViewProps) {
  return (
    <div
      className="w-24 h-24 p-2 relative"
      style={{ backgroundColor: props.bgColor }}
    >
      <div className="w-full h-full flex flex-col gap-2 items-center">
        {props.icon && (
          <div className="text-center w-20 h-10 ">
            {/* @ts-expect-error: Allow custom web component */}
            <ha-icon style={{ "--mdc-icon-size": "3rem" }} icon={props.icon} />
          </div>
        )}
        {!props.icon && (
          <div className="whitespace-nowrap w-20 h-10 text-center text-3xl overflow-clip ">
            {props.value ?? "N/A"}
          </div>
        )}
        {props.title && (
          <div className="text-sm whitespace-nowrap ">{props.title}</div>
        )}
      </div>
      {props.valueNW && (
        <div className="absolute top-0 left-0 p-1 text-xxs text-white">
          {props.valueNW}
        </div>
      )}
      {props.valueNE && (
        <div className="absolute top-0 right-0 p-1 text-xxs text-white">
          {props.valueNE}
        </div>
      )}
      {props.valueSW && (
        <div className="absolute bottom-0 left-0 p-1 text-xxs text-white">
          {props.valueSW}
        </div>
      )}
      {props.valueSE && (
        <div className="absolute bottom-0 right-0 p-1 text-xxs text-white">
          {props.valueSE}
        </div>
      )}
    </div>
  )
}
