import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  default: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  destructive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FCA5A5",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
    color: "#111827",
    marginBottom: 4,
  },
  descriptionContainer: {
    alignItems: "flex-start",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
});
