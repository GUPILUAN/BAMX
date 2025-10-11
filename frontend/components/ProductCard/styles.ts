import { StyleSheet, Dimensions } from "react-native";
const styles = StyleSheet.create({
  cardContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
  },
  image: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  loadingOverlay: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    bottom: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
});
const buttonStyle = (good: boolean) => ({
  backgroundColor: good ? "#78af6d" : "#d65f61",
  shadowColor: "#000",
  elevation: 10,
});

const cartText = () => ({
  color: "#fbfbfb",
  fontFamily: "SF-Pro-Semibold",
  fontSize: Dimensions.get("window").width * 0.013,
  textAlign: "center" as "center",
});
export { styles, buttonStyle, cartText };