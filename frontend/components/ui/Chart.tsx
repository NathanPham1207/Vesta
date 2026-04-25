import React, { ReactNode, createContext, useContext, useMemo } from "react";
import { Text, View } from "react-native";
import { styles } from "./Chart.styles";

const THEMES = {
  light: "",
  dark: "",
} as const;

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType<{ size?: number; color?: string }>;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = createContext<ChartContextProps | null>(null);

function useChart() {
  const context = useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

type ChartContainerProps = {
  id?: string;
  config: ChartConfig;
  children: ReactNode;
};

function ChartContainer({ config, children }: ChartContainerProps) {
  const value = useMemo(() => ({ config }), [config]);

  return (
    <ChartContext.Provider value={value}>
      <View style={styles.container}>{children}</View>
    </ChartContext.Provider>
  );
}

type ChartTooltipItem = {
  name?: string;
  value?: string | number;
  color?: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
};

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: ChartTooltipItem[];
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  label?: React.ReactNode;
  nameKey?: string;
  labelKey?: string;
};

function ChartTooltipContent({
  active,
  payload,
  hideLabel = false,
  hideIndicator = false,
  indicator = "dot",
  label,
  nameKey,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <View style={styles.tooltip}>
      {!hideLabel && label ? (
        <Text style={styles.tooltipLabel}>
          {typeof label === "string" || typeof label === "number" ? label : ""}
        </Text>
      ) : null}

      <View style={styles.tooltipList}>
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = item.color || getConfigColor(itemConfig);

          return (
            <View
              key={`${item.dataKey || item.name || index}`}
              style={styles.tooltipRow}
            >
              {!hideIndicator ? (
                <View
                  style={[
                    styles.indicatorBase,
                    indicator === "dot" && styles.indicatorDot,
                    indicator === "line" && styles.indicatorLine,
                    indicator === "dashed" && styles.indicatorDashed,
                    indicatorColor
                      ? {
                          borderColor: indicatorColor,
                          backgroundColor:
                            indicator === "dashed"
                              ? "transparent"
                              : indicatorColor,
                        }
                      : null,
                  ]}
                />
              ) : null}

              <View style={styles.tooltipTextBlock}>
                <Text style={styles.tooltipItemLabel}>
                  {renderLabelText(itemConfig?.label, item.name)}
                </Text>

                {item.value !== undefined ? (
                  <Text style={styles.tooltipItemValue}>
                    {typeof item.value === "number"
                      ? item.value.toLocaleString()
                      : item.value}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

type ChartLegendItem = {
  value?: string;
  color?: string;
  dataKey?: string;
};

type ChartLegendContentProps = {
  payload?: ChartLegendItem[];
  hideIcon?: boolean;
  verticalAlign?: "top" | "bottom";
  nameKey?: string;
};

function ChartLegendContent({
  payload,
  hideIcon = false,
  verticalAlign = "bottom",
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <View
      style={[
        styles.legend,
        verticalAlign === "top" ? styles.legendTop : styles.legendBottom,
      ]}
    >
      {payload.map((item, index) => {
        const key = `${nameKey || item.dataKey || item.value || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        const Icon = itemConfig?.icon;
        const itemColor = item.color || getConfigColor(itemConfig) || "#6B7280";

        return (
          <View
            key={`${item.value || item.dataKey || index}`}
            style={styles.legendItem}
          >
            {Icon && !hideIcon ? (
              <Icon size={12} color={itemColor} />
            ) : (
              <View
                style={[styles.legendSwatch, { backgroundColor: itemColor }]}
              />
            )}

            <Text style={styles.legendText}>
              {renderLabelText(itemConfig?.label, item.value)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function ChartStyle() {
  return null;
}

function ChartTooltip() {
  return null;
}

function ChartLegend() {
  return null;
}

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadRecord = payload as Record<string, unknown>;
  const nestedPayload =
    typeof payloadRecord.payload === "object" && payloadRecord.payload !== null
      ? (payloadRecord.payload as Record<string, unknown>)
      : undefined;

  let configLabelKey = key;

  if (typeof payloadRecord[key] === "string") {
    configLabelKey = payloadRecord[key] as string;
  } else if (nestedPayload && typeof nestedPayload[key] === "string") {
    configLabelKey = nestedPayload[key] as string;
  }

  return config[configLabelKey] || config[key];
}

function getConfigColor(itemConfig?: {
  color?: string;
  theme?: Record<"light" | "dark", string>;
}) {
  if (!itemConfig) return undefined;
  return itemConfig.color || itemConfig.theme?.light;
}

function renderLabelText(label: React.ReactNode, fallback?: React.ReactNode) {
  if (typeof label === "string" || typeof label === "number") {
    return String(label);
  }

  if (typeof fallback === "string" || typeof fallback === "number") {
    return String(fallback);
  }

  return "";
}

export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
};
