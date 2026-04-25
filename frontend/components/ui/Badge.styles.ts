import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    minHeight: 22,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },

  defaultBadge: {
    backgroundColor: "#2563EB",
    borderColor: "transparent",
  },
  defaultBadgeText: {
    color: "#FFFFFF",
  },

  secondaryBadge: {
    backgroundColor: "#E5E7EB",
    borderColor: "transparent",
  },
  secondaryBadgeText: {
    color: "#111827",
  },

  destructiveBadge: {
    backgroundColor: "#DC2626",
    borderColor: "transparent",
  },
  destructiveBadgeText: {
    color: "#FFFFFF",
  },

  outlineBadge: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
  },
  outlineBadgeText: {
    color: "#111827",
  },
});
