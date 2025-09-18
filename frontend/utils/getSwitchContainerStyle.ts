const getSwitchContainerStyle = (isDark: boolean) => ({
  flexDirection: "row" as "row",
  backgroundColor: isDark ? "#362e1d" : "#fff",
  borderRadius: 25,
  width: 400,
  height: 50,
  position: "relative" as "relative",
  overflow: "hidden" as "hidden",
});

export default getSwitchContainerStyle;