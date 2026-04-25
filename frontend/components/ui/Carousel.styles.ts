import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    position: "relative",
    width: "100%",
  },

  horizontalContent: {
    paddingHorizontal: 16,
  },

  verticalContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  item: {
    minWidth: 0,
    flexShrink: 0,
    flexGrow: 0,
  },

  navButton: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  navButtonDisabled: {
    opacity: 0.5,
  },

  prevHorizontal: {
    top: "50%",
    left: 4,
    marginTop: -16,
  },

  nextHorizontal: {
    top: "50%",
    right: 4,
    marginTop: -16,
  },

  prevVertical: {
    top: 4,
    left: "50%",
    marginLeft: -16,
    transform: [{ rotate: "90deg" }],
  },

  nextVertical: {
    bottom: 4,
    left: "50%",
    marginLeft: -16,
    transform: [{ rotate: "90deg" }],
  },

  srOnly: {
    display: "none",
  },
});
