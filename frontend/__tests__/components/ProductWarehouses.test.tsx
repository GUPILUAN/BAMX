import React from "react";
import { render } from "@testing-library/react-native";
import ProductWarehouses from "@/components/ProductWarehouses/ProductWarehouses";
import { useFetchProductWarehouses } from "@/hooks/useFetchProductWarehouses";
import { ProductLocation, ProductWarehouse } from "@/types/ProductLocation";
import { addDays } from "../utils/dateUtils";

jest.mock("@/hooks/useFetchProductWarehouses", () => ({
  useFetchProductWarehouses: jest.fn(),
}));

const mockHook = useFetchProductWarehouses as jest.Mock;

const almacen = (over: Partial<ProductWarehouse> = {}): ProductWarehouse => ({
  warehouse_id: 3,
  warehouse_name: "Almacén 3",
  stock_quantity: 0,
  lots_quantity: 0,
  lots_count: 0,
  lots_without_expiration: 0,
  nearest_expiration: null,
  ...over,
});

const location = (warehouses: ProductWarehouse[]): ProductLocation => ({
  product_id: "FRUT000GR",
  product_name: "FRUTA A GRANEL",
  unit: "pz",
  total_quantity: 57.7,
  warehouses,
});

const renderWith = (loc: ProductLocation | null, loading = false) => {
  mockHook.mockReturnValue({ location: loc, loading });
  return render(<ProductWarehouses productId="FRUT000GR" isDark={false} />);
};

describe("ProductWarehouses", () => {
  beforeEach(() => jest.clearAllMocks());

  it("muestra el almacén y la cantidad de los lotes cuando existen", () => {
    const { getByText } = renderWith(
      location([
        almacen({
          warehouse_id: 6,
          warehouse_name: "Almacén 6",
          lots_quantity: 200,
          lots_count: 1,
          nearest_expiration: addDays(new Date(), 30).toISOString(),
        }),
      ])
    );

    expect(getByText("Almacén 6")).toBeTruthy();
    expect(getByText("200 pz")).toBeTruthy();
  });

  // Existencia que vive sólo en MULT: es el caso de casi todo el catálogo de
  // BAMX, donde nadie capturó lote en Aspel.
  it("usa la existencia de MULT cuando el producto no tiene lotes", () => {
    const { getByText } = renderWith(
      location([almacen({ stock_quantity: 267.02 })])
    );

    expect(getByText("267.02 pz")).toBeTruthy();
    expect(getByText("Sin lote capturado en Aspel")).toBeTruthy();
  });

  it("avisa cuando los lotes no traen caducidad capturada", () => {
    const { getByText } = renderWith(
      location([
        almacen({
          warehouse_id: 1,
          warehouse_name: "Almacén 1",
          lots_quantity: 10,
          lots_count: 2,
          lots_without_expiration: 2,
          nearest_expiration: null,
        }),
      ])
    );

    expect(getByText("2 lotes · sin caducidad capturada")).toBeTruthy();
  });

  it("dice que ya caducó cuando la fecha quedó atrás", () => {
    const { getByText } = renderWith(
      location([
        almacen({
          lots_quantity: 2680,
          lots_count: 1,
          nearest_expiration: addDays(new Date(), -400).toISOString(),
        }),
      ])
    );

    expect(getByText(/caducó el/)).toBeTruthy();
  });

  it("cuenta los días cuando la caducidad está cerca", () => {
    const { getByText } = renderWith(
      location([
        almacen({
          lots_quantity: 50,
          lots_count: 1,
          nearest_expiration: addDays(new Date(), 3).toISOString(),
        }),
      ])
    );

    expect(getByText("1 lote · caduca en 3 días")).toBeTruthy();
  });

  // Si el API falla, retrieveData devuelve undefined y el hook deja null. La
  // sección tiene que decirlo, no inventar una ubicación.
  it("muestra el estado vacío cuando no hay ubicación", () => {
    const { getByText } = renderWith(null);

    expect(
      getByText("Sin existencia registrada en Aspel para este producto.")
    ).toBeTruthy();
  });
});
