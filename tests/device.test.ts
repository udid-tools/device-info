import { describe, expect, it } from "vitest";
import { getDevice, getDeviceModelName } from "../src/index.js";

describe("device resolution", () => {
  it("returns structured information for a known iPhone", () => {
    expect(getDevice("iPhone16,1")).toEqual({
      identifier: "iPhone16,1",
      family: "iPhone",
      model: "iPhone 15 Pro",
    });
  });

  it("resolves newly verified iPhone 18 Pro identifiers", () => {
    expect(getDevice("iPhone19,2")).toEqual({
      identifier: "iPhone19,2",
      family: "iPhone",
      model: "iPhone 18 Pro",
    });
    expect(getDeviceModelName("iPhone19,3")).toBe("iPhone 18 Pro Max");
    expect(getDeviceModelName("iPhone19,7")).toBe("iPhone 18 Pro Max");
  });

  it("returns structured information for a known iPad", () => {
    expect(getDevice("iPad16,6")).toEqual({
      identifier: "iPad16,6",
      family: "iPad",
      model: "iPad Pro 13-inch (M4)",
    });
  });

  it("trims surrounding whitespace but preserves exact casing", () => {
    expect(getDeviceModelName("  iPhone16,1  ")).toBe("iPhone 15 Pro");
    expect(getDeviceModelName("iphone16,1")).toBeUndefined();
  });

  it("does not disguise unknown identifiers as known models", () => {
    expect(getDevice("iPhone99,1")).toBeUndefined();
    expect(getDeviceModelName("unknown")).toBeUndefined();
    expect(getDevice("")).toBeUndefined();
  });
});
