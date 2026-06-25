import { describe, it, expect } from "vitest";
import { intensityColor, intensityLabel, formatDate } from "./utils";

describe("intensityColor", () => {
  it("returns green below 200", () => {
    expect(intensityColor(0)).toBe("#22c55e");
    expect(intensityColor(199)).toBe("#22c55e");
  });

  it("returns yellow-green from 200 to 399", () => {
    expect(intensityColor(200)).toBe("#84cc16");
    expect(intensityColor(399)).toBe("#84cc16");
  });

  it("returns amber from 400 to 599", () => {
    expect(intensityColor(400)).toBe("#f59e0b");
    expect(intensityColor(599)).toBe("#f59e0b");
  });

  it("returns orange from 600 to 799", () => {
    expect(intensityColor(600)).toBe("#f97316");
    expect(intensityColor(799)).toBe("#f97316");
  });

  it("returns red at 800 and above", () => {
    expect(intensityColor(800)).toBe("#ef4444");
    expect(intensityColor(2228)).toBe("#ef4444");
  });
});

describe("intensityLabel", () => {
  it("labels below 200 as Very Clean", () => {
    expect(intensityLabel(0)).toBe("Very Clean");
    expect(intensityLabel(199)).toBe("Very Clean");
  });

  it("labels 200-399 as Clean", () => {
    expect(intensityLabel(200)).toBe("Clean");
    expect(intensityLabel(350)).toBe("Clean");
  });

  it("labels 400-599 as Moderate", () => {
    expect(intensityLabel(400)).toBe("Moderate");
    expect(intensityLabel(554)).toBe("Moderate");
  });

  it("labels 600-799 as Dirty", () => {
    expect(intensityLabel(600)).toBe("Dirty");
    expect(intensityLabel(785)).toBe("Dirty");
  });

  it("labels 800 and above as Very Dirty", () => {
    expect(intensityLabel(800)).toBe("Very Dirty");
    expect(intensityLabel(1400)).toBe("Very Dirty");
  });

  it("color and label thresholds are consistent", () => {
    const cases = [0, 199, 200, 399, 400, 599, 600, 799, 800, 1200];
    const labels = cases.map(intensityLabel);
    const colors = cases.map(intensityColor);
    // same boundary should not produce different tier between label and color
    expect(labels[2]).toBe("Clean");
    expect(colors[2]).toBe("#84cc16");
    expect(labels[4]).toBe("Moderate");
    expect(colors[4]).toBe("#f59e0b");
  });
});

describe("formatDate", () => {
  it("returns a non-empty string for a valid ISO timestamp", () => {
    const result = formatDate("2026-06-25T07:00:00Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("includes the month and day", () => {
    const result = formatDate("2026-06-25T07:00:00Z");
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/25/);
  });

  it("includes a timezone abbreviation", () => {
    const result = formatDate("2026-06-25T07:00:00Z");
    // Should contain a timezone like PDT, UTC, EST, etc.
    expect(result).toMatch(/[A-Z]{2,5}/);
  });
});
