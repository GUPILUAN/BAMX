import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  animatedBg: {
    position: "absolute",
    width: "50%",
    height: "100%",
    backgroundColor: "#fbe8c4",
    borderRadius: 25,
    zIndex: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  innerShadowVertical: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    zIndex: -1,
  },
  innerShadowHorizontal: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    zIndex: -1,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  activeButton: {},
  activeText: {
    color: "#4A90E2",
  },
  inactiveText: {
    color: "#F5A623",
  },
});

export default styles;