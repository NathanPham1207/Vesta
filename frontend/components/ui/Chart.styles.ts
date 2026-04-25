import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    justifyContent: "center",
  },

  tooltip: {
    minWidth: 128,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  tooltipLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },

  tooltipList: {
    gap: 6,
  },

  tooltipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  tooltipTextBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  tooltipItemLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  tooltipItemValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },

  indicatorBase: {
    borderRadius: 2,
  },

  indicatorDot: {
    width: 10,
    height: 10,
  },

  indicatorLine: {
    width: 4,
    height: 16,
  },

  indicatorDashed: {
    width: 1,
    height: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },

  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 16,
  },

  legendTop: {
    paddingBottom: 12,
  },

  legendBottom: {
    paddingTop: 12,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  legendSwatch: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },

  legendText: {
    fontSize: 12,
    color: "#374151",
  },
});
