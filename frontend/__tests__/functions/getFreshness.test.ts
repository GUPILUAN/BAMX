import {
  getFreshness,
  FRESHNESS_GREEN,
  FRESHNESS_AMBER,
  FRESHNESS_RED,
} from "@/functions/getFreshness";

// Construye una caducidad ISO local a `days` días de hoy (al mediodía, para no
// pelear con zonas horarias en el truncado a fecha).
function expIn(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T12:00:00`;
}

describe("getFreshness - entregables", () => {
  it("verde y muchos puntos cuando caduca holgado", () => {
    const f = getFreshness(expIn(20), "entregable");
    expect(f.color).toBe(FRESHNESS_GREEN);
    expect(f.dots).toBe(5);
    expect(f.daysLeft).toBe(20);
    expect(f.label).toBe("Caduca en 20 días");
  });

  it("amarillo y pocos puntos cuando está por caducar (warning)", () => {
    const f = getFreshness(expIn(4), "entregable");
    expect(f.color).toBe(FRESHNESS_AMBER);
    expect(f.dots).toBe(2);
    expect(f.label).toBe("Caduca en 4 días");
  });

  it("usa 'mañana' para el día siguiente", () => {
    const f = getFreshness(expIn(1), "entregable");
    expect(f.label).toBe("Caduca mañana");
    expect(f.dots).toBe(1);
  });

  it("sin caducidad => sin puntos", () => {
    const f = getFreshness(null, "entregable");
    expect(f.dots).toBe(0);
    expect(f.label).toBe("Sin caducidad");
  });
});

describe("getFreshness - no aptos", () => {
  it("rojo y explica cuántos días lleva caducado", () => {
    const f = getFreshness(expIn(-2), "noapto");
    expect(f.color).toBe(FRESHNESS_RED);
    expect(f.dots).toBe(0);
    expect(f.label).toBe("Caducó hace 2 días");
  });

  it("rojo con 'Caduca hoy' cuando vence hoy", () => {
    const f = getFreshness(expIn(0), "noapto");
    expect(f.color).toBe(FRESHNESS_RED);
    expect(f.label).toBe("Caduca hoy");
  });

  it("rojo con 'Sin caducidad' cuando no hay fecha capturada", () => {
    const f = getFreshness(null, "noapto");
    expect(f.color).toBe(FRESHNESS_RED);
    expect(f.label).toBe("Sin caducidad");
  });
});
