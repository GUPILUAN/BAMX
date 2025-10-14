import { StyleSheet, Dimensions } from "react-native";
const styles = StyleSheet.create({
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "90%",
    marginVertical: 10,
  },
  statusBox: {
    alignItems: "center",
    flexDirection: "row",
  },
  number: {
    fontSize: Dimensions.get("window").width * 0.04,
    fontWeight: "bold",
  },
  description: {
    textAlign: "center",
    marginTop: 10,
    fontSize: Dimensions.get("window").width * 0.015,
    color: "#555",
  },
  separatorV: {
    width: 3,
    height: "100%",
    backgroundColor: "#D9D9D9",
  },

  gradientBarContainer: {
    width: "90%",
    height: 8,
    backgroundColor: "#FFF",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 20,
  },
  gradientBar: {
    width: "100%",
    height: "100%",
  },
});
export default styles;
