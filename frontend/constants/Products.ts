import { InventoryItem } from "@/types/InventoryItem";

export const productosDummy: { count: number; items: InventoryItem[] } = {
  count: 20,
  items: [
    {
      product_id: "PROD001",
      product_name: "Manzanas",
      lot: "L001",
      available_quantity: 50,
      production_date: "2024-10-10T00:00:00Z",
      expiration_date: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000
      ).toISOString(), // < 3 días
      last_movement: new Date().toISOString(),
      warehouse: 1,
      status: "critical",
      type: "fruit",
      image:
        "https://manzanaswashington.com/wp-content/uploads/2021/02/Nuestras-manzanas-portada1.jpg",
      type_id: "fruit01",
    },
    {
      product_id: "PROD002",
      product_name: "Plátano",
      lot: "L002",
      available_quantity: 30,
      production_date: "2024-10-11T00:00:00Z",
      expiration_date: new Date(
        Date.now() + 1 * 24 * 60 * 60 * 1000
      ).toISOString(), // < 3 días
      last_movement: new Date().toISOString(),
      warehouse: 1,
      status: "critical",
      type: "fruit",
      type_id: "fruit02",
      image:
        "https://www.lavanguardia.com/files/image_990_484/files/fp/uploads/2022/05/24/628ca146101ce.r_d.983-618.jpeg",
    },
    {
      product_id: "PROD003",
      product_name: "Leche Lala 2L",
      lot: "L003",
      available_quantity: 20,
      production_date: new Date("2024-10-12T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 4 * 24 * 60 * 60 * 1000
      ).toISOString(), // 3-5 días
      last_movement: new Date().toISOString(),
      warehouse: 2,
      status: "warning",
      type: "bottle",
      type_id: "bottle01",
      image:
        "https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00750102054704L.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF",
    },
    {
      product_id: "PROD004",
      product_name: "Peras",
      lot: "L004",
      available_quantity: 40,
      production_date: new Date("2024-10-13T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000
      ).toISOString(), // < 3 días
      last_movement: new Date().toISOString(),
      warehouse: 1,
      status: "A",
      type: "critical",
      type_id: "fruit03",
      image:
        "http://www.frutas-hortalizas.com/img/fruites_verdures/presentacio/26.jpg",
    },
    {
      product_id: "PROD005",
      product_name: "Uvas",
      lot: "L005",
      available_quantity: 25,
      production_date: new Date("2024-10-14T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      ).toISOString(), // 3-5 días
      last_movement: new Date().toISOString(),
      warehouse: 1,
      status: "warning",
      type: "fruit",
      type_id: "fruit04",
      image:
        "https://cdn.clinicabaviera.com/blog/wp-content/uploads/2017/04/iStock-153009876.jpg",
    },
    {
      product_id: "PROD006",
      product_name: "Frijoles enlatados",
      lot: "L006",
      available_quantity: 100,
      production_date: new Date("2024-10-14T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 8 * 24 * 60 * 60 * 1000
      ).toISOString(), // > 5 días
      last_movement: new Date().toISOString(),
      warehouse: 2,
      status: "good",
      type: "canned_food",
      type_id: "canned_food01",
      image:
        "https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00750105242042L.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF",
    },
    {
      product_id: "PROD007",
      product_name: "Sopa de tomate enlatada",
      lot: "L007",
      available_quantity: 80,
      production_date: new Date("2024-10-15T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 9 * 24 * 60 * 60 * 1000
      ).toISOString(), // > 5 días
      last_movement: new Date().toISOString(),
      warehouse: 2,
      status: "good",
      type: "canned_food",
      type_id: "canned_food02",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/c/c4/Campbell_tomato_soup_cans.jpg",
    },
    {
      product_id: "PROD008",
      product_name: "Agua embotellada 1L",
      lot: "L008",
      available_quantity: 200,
      production_date: new Date("2024-10-14T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 1 * 24 * 60 * 60 * 1000
      ).toISOString(), // < 3 días
      last_movement: new Date().toISOString(),
      warehouse: 3,
      status: "critical",
      type: "bottle",
      type_id: "bottle02",
      image:
        "https://oneiconn.vtexassets.com/arquivos/ids/196680-1600-auto?v=638518423522700000&width=1600&height=auto&aspect=true",
    },
    {
      product_id: "PROD009",
      product_name: "Aceite vegetal",
      lot: "L009",
      available_quantity: 60,
      production_date: new Date("2024-10-13T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      ).toISOString(), // > 5 días
      last_movement: new Date().toISOString(),
      warehouse: 3,
      status: "good",
      type: "bottle",
      type_id: "bottle03",
      image:
        "https://www.mayoreototal.mx/cdn/shop/products/000643365m_1080x.jpg?v=1563810943",
    },
    {
      product_id: "PROD010",
      product_name: "Arroz",
      lot: "L010",
      available_quantity: 150,
      production_date: new Date("2024-10-15T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000
      ).toISOString(), // < 3 días
      last_movement: new Date().toISOString(),
      warehouse: 2,
      status: "critical",
      type: "grain",
      type_id: "grain01",
      image:
        "https://http2.mlstatic.com/D_NQ_NP_2X_934364-MLM53948384834_022023-F.webp",
    },
    {
      product_id: "PROD011",
      product_name: "Harina de maíz",
      lot: "L011",
      available_quantity: 90,
      production_date: new Date("2024-10-16T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 5 * 24 * 60 * 60 * 1000
      ).toISOString(), // 3-5 días
      last_movement: new Date().toISOString(),
      warehouse: 2,
      status: "warning",
      type: "grain",
      type_id: "grain02",
      image:
        "https://i5.walmartimages.com.mx/samsmx/images/product-images/img_large/000707012l.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF",
    },
    {
      product_id: "PROD012",
      product_name: "Atún enlatado",
      lot: "L012",
      available_quantity: 120,
      production_date: new Date("2024-10-17T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(), // > 5 días
      last_movement: new Date().toISOString(),
      warehouse: 3,
      status: "good",
      type: "canned_food",
      type_id: "canned_food02",
      image:
        "https://clickabasto.com/cdn/shop/products/enlatados_dolores_atun_295g_400x400.jpg?v=1554184862",
    },
    {
      product_id: "PROD013",
      product_name: "Sardinas enlatadas",
      lot: "L013",
      available_quantity: 100,
      production_date: new Date("2024-10-18T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 6 * 24 * 60 * 60 * 1000
      ).toISOString(), // > 5 días
      last_movement: new Date().toISOString(),
      warehouse: 2,
      status: "good",
      type: "canned_food",
      type_id: "canned_food03",
      image:
        "https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00073108200100L.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF",
    },
    {
      product_id: "PROD014",
      product_name: "Leche en polvo",
      lot: "L014",
      available_quantity: 70,
      production_date: new Date("2024-10-19T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 20 * 24 * 60 * 60 * 1000
      ).toISOString(), // > 5 días
      last_movement: new Date().toISOString(),
      warehouse: 3,
      status: "good",
      type: "grain",
      type_id: "grain03",
      image:
        "https://www.superaki.mx/cdn/shop/products/7501059295193_260821_78506687-a989-46d0-8be9-5525e742e32f_300x300.jpg?v=1654699058",
    },
    {
      product_id: "PROD015",
      product_name: "Spaghetti",
      lot: "L015",
      available_quantity: 150,
      production_date: new Date("2024-10-20T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      ).toISOString(), // 3-5 días
      last_movement: new Date().toISOString(),
      warehouse: 1,
      status: "warning",
      type: "grain",
      type_id: "grain04",
      image:
        "https://www.allservefoodservice.com/wp-content/uploads/2017/10/Spaghetti-Mediano-Barilla-25-500-gr-1.jpg",
    },
    {
      product_id: "PROD016",
      product_name: "Mermelada de fresa",
      lot: "L016",
      available_quantity: 50,
      production_date: new Date("2024-10-21T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 25 * 24 * 60 * 60 * 1000
      ).toISOString(), // > 5 días
      last_movement: new Date().toISOString(),
      warehouse: 3,
      status: "good",
      type: "jar",
      type_id: "jar01",
      image:
        "https://calimaxmx.vtexassets.com/arquivos/ids/162838-1600-auto?v=638050236611830000&width=1600&height=auto&aspect=true",
    },
    {
      product_id: "PROD017",
      product_name: "Galletas saladas",
      lot: "L017",
      available_quantity: 110,
      production_date: new Date("2024-10-22T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000
      ).toISOString(), // < 3 días
      last_movement: new Date().toISOString(),
      warehouse: 2,
      status: "critical",
      type: "snack",
      type_id: "snack01",
      image:
        "https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00750100066422L.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF",
    },
    {
      product_id: "PROD018",
      product_name: "Jugo de naranja",
      lot: "L018",
      available_quantity: 200,
      production_date: new Date("2024-10-23T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 4 * 24 * 60 * 60 * 1000
      ).toISOString(), // 3-5 días
      last_movement: new Date().toISOString(),
      warehouse: 1,
      status: "warning",
      type: "bottle",
      type_id: "bottle03",
      image:
        "https://calimaxmx.vtexassets.com/arquivos/ids/201027-1200-auto?v=637970501279700000&width=1200&height=auto&aspect=true",
    },
    {
      product_id: "PROD019",
      product_name: "Frijol negro",
      lot: "L019",
      available_quantity: 140,
      production_date: new Date("2024-10-24T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 40 * 24 * 60 * 60 * 1000
      ).toISOString(), // > 5 días
      last_movement: new Date().toISOString(),
      warehouse: 2,
      status: "good",
      type: "grain",
      type_id: "grain03",
      image:
        "https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00750107130149L.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF",
    },
    {
      product_id: "PROD020",
      product_name: "Sopa de pollo enlatada",
      lot: "L020",
      available_quantity: 90,
      production_date: new Date("2024-10-25T00:00:00Z").toISOString(),
      expiration_date: new Date(
        Date.now() + 60 * 24 * 60 * 60 * 1000
      ).toISOString(), // > 5 días
      last_movement: new Date().toISOString(),
      warehouse: 3,
      status: "good",
      type: "canned_food",
      type_id: "canned_food03",
      image: "https://m.media-amazon.com/images/I/81b9L3xtVgL._AC_SL1500_.jpg",
    },
  ],
};
