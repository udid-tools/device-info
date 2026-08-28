import { describe, expect, it } from "vitest";
import { DEVICE_MODELS } from "../src/data/device-models.js";
import { OS_BUILD_VERSIONS } from "../src/data/os-builds.js";
import { getDevice, getOsVersion } from "../src/index.js";

describe("catalog integrity", () => {
  it("contains a meaningful historical device catalog", () => {
    const entries = Object.entries(DEVICE_MODELS);
    expect(entries.length).toBeGreaterThan(150);

    for (const [identifier, model] of entries) {
      expect(identifier).toMatch(/^(?:iPhone|iPad)\d+,\d+$/);
      expect(model.trim()).toBe(model);
      expect(model.length).toBeGreaterThan(0);
      expect(getDevice(identifier)).toMatchObject({ identifier, model });
    }
  });

  it("contains valid and resolvable historical OS builds", () => {
    const entries = Object.entries(OS_BUILD_VERSIONS);
    expect(entries.length).toBeGreaterThan(350);

    for (const [build, catalogVersion] of entries) {
      expect(build).toMatch(/^\d+[A-Z]\d+[a-z]?$/);
      expect(catalogVersion).toMatch(
        /^\d+(?:\.\d+){0,2}(?: (?:beta \d+|(?:release candidate|rc)(?: \d+)?|\([a-z]\)))?$/i
      );

      const resolved = getOsVersion({ productIdentifier: "iPhone1,1", build });
      expect(resolved.known).toBe(true);
      if (resolved.known) expect(resolved.build).toBe(build);
    }
  });
});
