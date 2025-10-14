const getTemperatureStyle = (temperature: number, isActive: boolean) => ({
  fontSize: 36,
  color:
    !isActive || temperature > 5
      ? "red"
      : temperature < -10
        ? "#003366"
        : "#4193f7",
});
export default getTemperatureStyle;