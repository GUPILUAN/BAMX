import { renderHook, waitFor } from "@testing-library/react-native";
import useFetchLotes from "@/hooks/useFetchLotes";
import { apiService } from "@/api/apiService";
import { productosDummy } from "@/constants/Products";
import { Lot } from "@/types/Lot";

jest.mock("@/api/apiService", () => ({
  apiService: { retrieveData: jest.fn() },
}));

const retrieveData = apiService.retrieveData as jest.Mock;

const lote = (over: Partial<Lot> = {}): Lot =>
  ({
    product_id: "FRUT000GR",
    product_name: "FRUTA A GRANEL",
    lot: "L26-0801B",
    available_quantity: 50,
    expiration_date: new Date().toISOString(),
    warehouse: 1,
    status: "critical",
    ...over,
  }) as Lot;

describe("useFetchLotes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("pide una página lo bastante grande para no truncar el Semáforo", async () => {
    retrieveData.mockResolvedValue({ content: [] });
    renderHook(() => useFetchLotes());

    await waitFor(() => expect(retrieveData).toHaveBeenCalled());

    const url: string = retrieveData.mock.calls[0][0];
    expect(url).toContain("/api/lotes/");

    // El default del backend es size=20 ordenando por caducidad ascendente: con
    // ese tamaño los lotes estables quedan fuera y el Home los reporta como 0.
    const size = Number(/[?&]size=(\d+)/.exec(url)?.[1]);
    expect(size).toBeGreaterThan(20);
  });

  it("expone los lotes que devuelve el API", async () => {
    const content = [lote(), lote({ product_id: "YOGH450GR", status: "good" })];
    retrieveData.mockResolvedValue({ content });

    const { result } = renderHook(() => useFetchLotes());

    await waitFor(() => expect(result.current).toHaveLength(2));
    expect(result.current[1].product_id).toBe("YOGH450GR");
  });

  it("cae a los productos dummy si el API falla", async () => {
    retrieveData.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFetchLotes());

    await waitFor(() =>
      expect(result.current).toHaveLength(productosDummy.items.length)
    );
  });
});
