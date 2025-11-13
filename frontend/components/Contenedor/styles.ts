import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 18,
    maxWidth: "90%",
    height: 300,
    justifyContent: "space-between",
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 20,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 30,
  },

  infoContainer: {
    flexDirection: "column",
    marginHorizontal: 16,
    justifyContent: "center",
    flex: 0.35,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 12,
  },

  headerText: {
    marginLeft: 10,
  },

  chartContainer: {
    flexDirection: "column",
    height: "100%",
    flex: 0.65,

    borderRadius: 16,
    padding: 10,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  statusButton: {
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },

  lastUpdate: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },

  chart: {
    marginTop: 6,
    borderRadius: 16,
    alignSelf: "center",
  },
});

export default styles;
