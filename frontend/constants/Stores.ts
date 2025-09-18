export const contenedoresDummy = {
  count: 4,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      name: "Congelador 1",
      is_active: true,
      last_opened: "18 de agosto 2025- 11:22am",
      temperature: -18,
      labels: ["Carnes", "Mariscos", "Verduras", "Lácteos", "Otros"],
      data: [
        [60, 30, 100], //carnes [verde, amarillo, rojo]
        [50, 20, 15], //mariscos [verde, amarillo, rojo]
        [30, 50, 20], //verduras [verde, amarillo, rojo]
        [40, 35, 25], //lácteos [verde, amarillo, rojo]
        [20, 40, 30], //otros [verde, amarillo, rojo]
      ],
    },
    {
      id: 2,
      name: "Refrigerador 1",
      is_active: true,
      last_opened: "16 de agosto 2025 - 10:45am",
      temperature: -2,
      labels: ["Carnes", "Mariscos", "Verduras", "Lácteos", "Otros"],
      data: [
        [12, 45, 78],
        [33, 21, 56],
        [90, 15, 40],
        [25, 60, 10],
        [50, 30, 70],
      ],
    },
    {
      id: 3,
      name: "Refrigerador 2",
      is_active: false,
      last_opened: "4 de agosto 2025 - 5:01am",
      temperature: -1,
      labels: ["Carnes", "Mariscos", "Verduras", "Lácteos", "Otros"],
      data: [
        [5, 80, 20],
        [60, 25, 35],
        [40, 70, 10],
        [30, 50, 60],
        [20, 90, 15],
      ],
    },
    {
      id: 4,
      name: "Refrigerador 3",
      is_active: true,
      last_opened: "6 de agosto 2025 - 8:05am",
      temperature: -3,
      labels: ["Carnes", "Mariscos", "Verduras", "Lácteos", "Otros"],
      data: [
        [70, 10, 30],
        [15, 65, 40],
        [50, 20, 85],
        [35, 45, 25],
        [60, 30, 55],
      ],
    },
  ],
};
