const getColor = (state: string) => {
    if (state === "crítico") {
      return "#FF4D4F";
    } else if (state === "prioritario") {
      return "#FFC107";
    } else {
      return "#52C41A";
    }
};

export default getColor;