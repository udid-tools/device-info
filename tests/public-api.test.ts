import { describe, expect, expectTypeOf, it } from "vitest";
import {
  formatOsVersion,
  getDevice,
  getDeviceModelName,
  getOsVersion,
  type DeviceInfo,
  type OsVersionResolution,
} from "../src/index.js";

describe("public API", () => {
  it("exports the stable 1.0 function surface", () => {
    expect(getDevice).toBeTypeOf("function");
    expect(getDeviceModelName).toBeTypeOf("function");
    expect(getOsVersion).toBeTypeOf("function");
    expect(formatOsVersion).toBeTypeOf("function");

    expectTypeOf(getDevice).returns.toEqualTypeOf<DeviceInfo | undefined>();
    expectTypeOf(getOsVersion).returns.toEqualTypeOf<OsVersionResolution>();
  });
});
