import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  textBase: {
    fontSize: 14,
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.9,
  },

  disabled: {
    opacity: 0.5,
  },

  variantDefault: {
    backgroundColor: "#2563EB",
  },
  variantDefaultText: {
    color: "#FFFFFF",
  },

  variantDestructive: {
    backgroundColor: "#DC2626",
  },
  variantDestructiveText: {
    color: "#FFFFFF",
  },

  variantOutline: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  variantOutlineText: {
    color: "#111827",
  },

  variantSecondary: {
    backgroundColor: "#E5E7EB",
  },
  variantSecondaryText: {
    color: "#111827",
  },

  variantGhost: {
    backgroundColor: "transparent",
  },
  variantGhostText: {
    color: "#111827",
  },

  variantLink: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: 0,
  },
  variantLinkText: {
    color: "#2563EB",
    textDecorationLine: "underline",
  },

  sizeDefault: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sizeSm: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sizeLg: {
    minHeight: 44,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  sizeIcon: {
    width: 40,
    height: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
