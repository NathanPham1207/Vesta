import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  centeredContainer: {
    width: "100%",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    position: "relative",
  },

  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.75,
  },

  closeButtonPressed: {
    opacity: 1,
  },

  header: {
    gap: 8,
  },

  footer: {
    marginTop: 8,
    gap: 8,
    flexDirection: "column",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
    color: "#111827",
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
});
