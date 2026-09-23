import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { formatOsVersion, getDevice, getDeviceModelName, getOsVersion } from "../src/index.js";
import { parseCatalogVersion } from "../src/os-version.js";

const FUZZ_RUNS = 1_000;
const arbitraryText = fc.string({ unit: "binary", maxLength: 512 });

describe("property-based fuzzing", () => {
  it("keeps device lookups total and internally consistent for arbitrary Unicode", () => {
    fc.assert(
      fc.property(arbitraryText, (productIdentifier) => {
        const device = getDevice(productIdentifier);
        const modelName = getDeviceModelName(productIdentifier);

        expect(modelName).toBe(device?.model);
        if (device) {
          expect(device.identifier).toBe(productIdentifier.trim());
          expect(device.identifier.startsWith(device.family)).toBe(true);
        }
      }),
      { numRuns: FUZZ_RUNS }
    );
  });

  it("preserves arbitrary unknown builds without inventing OS metadata", () => {
    fc.assert(
      fc.property(arbitraryText, arbitraryText, (productIdentifier, payload) => {
        const build = `__fuzz__${payload}__end__`;
        const resolved = getOsVersion({ productIdentifier, build });
        const formatted = formatOsVersion({ productIdentifier, build });

        expect(resolved).toEqual({
          known: false,
          platform: productIdentifier.trim().startsWith("iPhone")
            ? "iOS"
            : productIdentifier.trim().startsWith("iPad")
              ? "iPadOS"
              : "unknown",
          build,
        });
        expect(formatted).toEqual({
          displayValue: `Build ${build}`,
          copyValue: build,
          rawBuild: build,
        });
      }),
      { numRuns: FUZZ_RUNS }
    );
  });

  it("normalizes generated prerelease and security-response catalog values", () => {
    const version = fc
      .array(fc.integer({ min: 0, max: 999 }), { minLength: 1, maxLength: 3 })
      .map((parts) => parts.join("."));
    const sequence = fc.integer({ min: 1, max: 999_999 });
    const responseLetter = fc
      .integer({ min: 97, max: 122 })
      .map((value) => String.fromCharCode(value));

    fc.assert(
      fc.property(version, sequence, responseLetter, (generatedVersion, number, letter) => {
        const sequenceLabel = String(number);

        expect(parseCatalogVersion(`${generatedVersion} beta ${sequenceLabel}`)).toEqual({
          version: generatedVersion,
          releaseChannel: "beta",
          releaseLabel: `beta ${sequenceLabel}`,
        });
        expect(parseCatalogVersion(`${generatedVersion} RC ${sequenceLabel}`)).toEqual({
          version: generatedVersion,
          releaseChannel: "release-candidate",
          releaseLabel: `release candidate ${sequenceLabel}`,
        });
        expect(parseCatalogVersion(`${generatedVersion} (${letter})`)).toEqual({
          version: generatedVersion,
          releaseChannel: "rapid-security-response",
          releaseLabel: letter,
        });
      }),
      { numRuns: FUZZ_RUNS }
    );
  });

  it("handles long untrusted strings without throwing or truncating unknown builds", () => {
    fc.assert(
      fc.property(fc.string({ unit: "binary", minLength: 1_024, maxLength: 4_096 }), (payload) => {
        const build = `__long_fuzz__${payload}__end__`;
        const formatted = formatOsVersion({ productIdentifier: payload, build });

        expect(formatted.copyValue).toBe(build);
        expect(formatted.rawBuild).toBe(build);
      }),
      { numRuns: 100 }
    );
  });
});
