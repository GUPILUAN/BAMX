import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    maxWidth: "100%",
    height: 300,
    justifyContent: "space-evenly",
  },
  infoContainer: {
    flexDirection: "column",
    marginHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  headerText: {
    marginLeft: 10,
  },

  chartContainer: {
    flexDirection: "column",
    height: "auto",
    width: "60%",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusButton: {
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#d8d8d8",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  lastUpdate: {
    fontSize: 12,
    color: "#888",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default styles;