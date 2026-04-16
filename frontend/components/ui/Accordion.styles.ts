import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  trigger: {
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  triggerContent: {
    flex: 1,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "0deg" }],
  },
  iconOpen: {
    transform: [{ rotate: "180deg" }],
  },
  content: {
    paddingBottom: 14,
    paddingHorizontal: 4,
  },
});
