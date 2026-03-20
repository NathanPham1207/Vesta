import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 6,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 20,
  },

  description: {
    fontSize: 14,
    color: "#6B7280",
  },

  action: {
    position: "absolute",
    top: 20,
    right: 20,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
});
