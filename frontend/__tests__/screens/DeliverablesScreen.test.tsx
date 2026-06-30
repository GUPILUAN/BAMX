import React from "react";
import { render } from "@testing-library/react-native";
import { TestWrapper } from "../utils/testUtils";
import DeliverablesScreen from "@/components/DeliverablesScreen/DeliverablesScreen";
import { DeliverableProduct } from "@/types/DeliverableProduct";

// El modal de detalles navega por aquí; lo mockeamos para no tocar expo-router.
jest.mock("@/functions/NavigationService", () => ({ navigate: jest.fn() }));

// Controlamos los datos mockeando el hook (la agregación/fetch se prueba aparte).
const mockUse = jest.fn();
jest.mock("@/hooks/useFetchDeliverables", () => ({
  __esModule: true,
  default: (variant: string) => mockUse(variant),
}));

function futureISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const product = (over: Partial<DeliverableProduct>): DeliverableProduct => ({
  product_id: "P1",
  product_name: "Fruta a granel",
  type: "FRUTA PERECEDERA",
  type_id: "FYV",
  image: null,
  total_quantity: 57,
  nearest_expiration: futureISO(10),
  lots_count: 1,
  ...over,
});

function setHook(over: Partial<ReturnType<typeof mockUse>> = {}) {
  mockUse.mockReturnValue({
    products: [],
    totalCount: 0,
    truncated: false,
    loading: false,
    refresh: jest.fn(),
    ...over,
  });
}

const renderScreen = (variant: "entregable" | "noapto") =>
  render(
    <TestWrapper>
      <DeliverablesScreen variant={variant} />
    </TestWrapper>
  );

describe("DeliverablesScreen", () => {
  beforeEach(() => jest.clearAllMocks());

  it("muestra título y resumen del bucket entregable", () => {
    setHook({ products: [], totalCount: 0, loading: false });
    const { getByText } = renderScreen("entregable");
    expect(getByText("Productos entregables")).toBeTruthy();
    expect(getByText("0 productos listos para entregar")).toBeTruthy();
  });

  it("muestra un empty state honesto cuando no hay productos", () => {
    setHook({ products: [], totalCount: 0, loading: false });
    const { getByText } = renderScreen("entregable");
    expect(getByText("Aún no hay productos entregables")).toBeTruthy();
  });

  it("renderiza una tarjeta por producto", () => {
    const products = [
      product({ product_id: "P1", product_name: "Fruta a granel" }),
      product({ product_id: "P2", product_name: "Yoghurt natural" }),
    ];
    setHook({ products, totalCount: 2, loading: false });
    const { getByText } = renderScreen("entregable");
    expect(getByText("Fruta a granel")).toBeTruthy();
    expect(getByText("Yoghurt natural")).toBeTruthy();
  });

  it("usa el título y el empty state de no aptos en su variant", () => {
    setHook({ products: [], totalCount: 0, loading: false });
    const { getByText } = renderScreen("noapto");
    expect(getByText("Productos no aptos")).toBeTruthy();
    expect(getByText("Nada marcado como no apto")).toBeTruthy();
  });

  it("muestra aviso de lista parcial cuando el bucket viene truncado", () => {
    setHook({
      products: [product({})],
      totalCount: 1,
      truncated: true,
      loading: false,
    });
    const { getByText } = renderScreen("entregable");
    expect(getByText(/Lista parcial/)).toBeTruthy();
  });
});
