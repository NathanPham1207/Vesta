import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  command: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
  },

  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  dialog: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    zIndex: 2,
  },

  srOnly: {
    display: "none",
  },

  inputWrapper: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 12,
  },

  list: {
    maxHeight: 300,
  },

  listContent: {
    paddingVertical: 4,
  },

  empty: {
    textAlign: "center",
    fontSize: 14,
    color: "#6B7280",
    paddingVertical: 24,
  },

  group: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  groupHeading: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },

  item: {
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  itemPressed: {
    backgroundColor: "#F3F4F6",
  },

  itemDisabled: {
    opacity: 0.5,
  },

  shortcut: {
    marginLeft: "auto",
    fontSize: 12,
    letterSpacing: 1,
    color: "#6B7280",
  },
});
