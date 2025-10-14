import { Dimensions } from "react-native";

const styles = {
  titleText: (category: string) => ({
    color:
      category === "crítico"
        ? "#FF4D4F"
        : category === "prioritario"
          ? "#FFC107"
          : "#52C41A",
    fontFamily: "SF-Compact-Semibold",
    fontSize: Dimensions.get("window").width * 0.035,
    marginRight: 5,
  }),
};

export default styles;