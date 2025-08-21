import {
  formatDate,
  evaluateExpirationStatus,
  getStatusColor,
  getUnitLabel,
} from "./dateUtils";

describe("Date Utilities", () => {
  describe("formatDate", () => {
    it("formats date string correctly", () => {
      expect(formatDate("2025-08-01")).toBe("01/08/2025");
      expect(formatDate("2025-12-25")).toBe("25/12/2025");
      expect(formatDate("2025-01-15")).toBe("15/01/2025");
    });

    it("handles single digit days and months", () => {
      expect(formatDate("2025-01-01")).toBe("01/01/2025");
      expect(formatDate("2025-09-05")).toBe("05/09/2025");
    });
  });

  describe("evaluateExpirationStatus", () => {
    beforeEach(() => {
      // Set a fixed date for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-08-21"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("returns crítico for products expiring in 2 days or less", () => {
      expect(evaluateExpirationStatus("2025-08-23")).toBe("crítico"); // 2 days
      expect(evaluateExpirationStatus("2025-08-22")).toBe("crítico"); // 1 day
      expect(evaluateExpirationStatus("2025-08-21")).toBe("crítico"); // today
    });

    it("returns prioritario for products expiring in 3-5 days", () => {
      expect(evaluateExpirationStatus("2025-08-24")).toBe("prioritario"); // 3 days
      expect(evaluateExpirationStatus("2025-08-26")).toBe("prioritario"); // 5 days
    });

    it("returns estable for products expiring in more than 5 days", () => {
      expect(evaluateExpirationStatus("2025-08-27")).toBe("estable"); // 6 days
      expect(evaluateExpirationStatus("2025-08-30")).toBe("estable"); // 9 days
      expect(evaluateExpirationStatus("2025-09-01")).toBe("estable"); // 11 days
    });
  });

  describe("getStatusColor", () => {
    it("returns correct colors for each status", () => {
      expect(getStatusColor("crítico")).toBe("#FF4D4F");
      expect(getStatusColor("prioritario")).toBe("#FFC107");
      expect(getStatusColor("estable")).toBe("#52C41A");
    });

    it("returns default color for unknown status", () => {
      expect(getStatusColor("unknown")).toBe("#000000");
      expect(getStatusColor("")).toBe("#000000");
    });
  });

  describe("getUnitLabel", () => {
    it("returns correct unit labels for different product types", () => {
      expect(getUnitLabel("fruit")).toBe("unidades");
      expect(getUnitLabel("canned_food")).toBe("latas");
      expect(getUnitLabel("bottle")).toBe("botellas");
      expect(getUnitLabel("grain")).toBe("kilogramos");
      expect(getUnitLabel("dairy")).toBe("litros");
      expect(getUnitLabel("snack")).toBe("paquetes");
      expect(getUnitLabel("jar")).toBe("frasco");
    });

    it("returns default unit for unknown product type", () => {
      expect(getUnitLabel("unknown")).toBe("unidades");
      expect(getUnitLabel("")).toBe("unidades");
    });
  });
});
