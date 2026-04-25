import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  content: {
    minWidth: 180,
    maxWidth: 280,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    padding: 6,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 2,
  },

  subContent: {
    marginTop: 6,
    marginLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#E5E7EB",
    paddingLeft: 6,
  },

  group: {
    width: "100%",
  },

  item: {
    minHeight: 36,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  itemInset: {
    paddingLeft: 24,
  },

  itemPressed: {
    backgroundColor: "#F3F4F6",
  },

  itemDisabled: {
    opacity: 0.5,
  },

  itemDestructive: {},

  itemText: {
    fontSize: 14,
    color: "#111827",
  },

  itemTextDestructive: {
    color: "#DC2626",
  },

  itemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  checkboxItem: {
    paddingLeft: 30,
  },

  leadingIcon: {
    position: "absolute",
    left: 8,
    width: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 6,
    marginHorizontal: -2,
  },

  shortcut: {
    marginLeft: "auto",
    fontSize: 12,
    color: "#6B7280",
    letterSpacing: 1,
  },
});
