const getStatusStyle = (isActive: boolean) => ({
  color: isActive ? "green" : "red",
  fontWeight: "bold" as "bold",
});

export default getStatusStyle;