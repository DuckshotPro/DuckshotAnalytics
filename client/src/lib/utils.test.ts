import { describe, it, expect } from "vitest";
import { formatNumber, formatPercentage, getGrowthColor } from "./utils";

describe("utils", () => {
  describe("formatNumber", () => {
    it("formats millions correctly", () => {
      expect(formatNumber(1500000)).toBe("1.5M");
      expect(formatNumber(1000000)).toBe("1.0M");
    });

    it("formats thousands correctly", () => {
      expect(formatNumber(1500)).toBe("1.5K");
      expect(formatNumber(1000)).toBe("1.0K");
    });

    it("formats small numbers correctly", () => {
      expect(formatNumber(500)).toBe("500");
      expect(formatNumber(0)).toBe("0");
    });
  });

  describe("formatPercentage", () => {
    it("formats percentage correctly", () => {
      expect(formatPercentage(12.345)).toBe("12.3%");
      expect(formatPercentage(10)).toBe("10.0%");
    });
  });

  describe("getGrowthColor", () => {
    it("returns green for positive growth", () => {
      expect(getGrowthColor(10)).toBe("text-green-500");
      expect(getGrowthColor(0)).toBe("text-green-500");
    });

    it("returns red for negative growth", () => {
      expect(getGrowthColor(-10)).toBe("text-red-500");
    });
  });
});
