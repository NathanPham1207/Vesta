import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  breadcrumb: {
    width: "100%",
  },
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkWrapper: {
    justifyContent: "center",
  },
  link: {
    fontSize: 14,
    color: "#6B7280",
  },
  page: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "400",
  },
  separator: {
    marginHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  ellipsis: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  srOnly: {
    display: "none",
  },
});
