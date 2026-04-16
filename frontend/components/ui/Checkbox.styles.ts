import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  containerChecked: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  containerDisabled: {
    opacity: 0.5,
  },

  containerPressed: {
    opacity: 0.85,
  },

  indicator: {
    alignItems: "center",
    justifyContent: "center",
  },
});
