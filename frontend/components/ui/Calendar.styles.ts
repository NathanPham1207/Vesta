import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
  },
  emptyCell: {
    flex: 1,
    height: 40,
    marginHorizontal: 2,
  },
  dayButton: {
    flex: 1,
    height: 40,
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 14,
    color: "#111827",
  },
  todayButton: {
    backgroundColor: "#E5E7EB",
  },
  todayText: {
    color: "#111827",
    fontWeight: "600",
  },
  selectedButton: {
    backgroundColor: "#2563EB",
  },
  selectedText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
