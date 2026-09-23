import { describe, expect, it } from "vitest";
import { formatOsVersion, getOsVersion } from "../src/index.js";
import { parseCatalogVersion } from "../src/os-version.js";

describe("OS version resolution", () => {
  it("resolves a stable iOS build", () => {
    expect(getOsVersion({ productIdentifier: "iPhone16,1", build: "23F77" })).toEqual({
      known: true,
      platform: "iOS",
      version: "26.5",
      build: "23F77",
      releaseChannel: "stable",
    });
  });

  it("uses iOS for old iPad releases and iPadOS for current releases", () => {
    expect(getOsVersion({ productIdentifier: "iPad1,1", build: "7B367" })).toMatchObject({
      known: true,
      platform: "iOS",
      version: "3.2",
    });
    expect(getOsVersion({ productIdentifier: "iPad16,6", build: "23F77" })).toMatchObject({
      known: true,
      platform: "iPadOS",
      version: "26.5",
    });
    expect(getOsVersion({ productIdentifier: "iPad8,1", build: "17A577" })).toMatchObject({
      known: true,
      platform: "iOS",
      version: "13.0",
    });
    expect(getOsVersion({ productIdentifier: "iPad8,1", build: "17A844" })).toMatchObject({
      known: true,
      platform: "iPadOS",
      version: "13.1",
    });
  });

  it("returns a discriminated unknown result without inventing a version", () => {
    expect(getOsVersion({ productIdentifier: "iPhone99,1", build: "99A999" })).toEqual({
      known: false,
      platform: "iOS",
      build: "99A999",
    });
    expect(getOsVersion({ productIdentifier: "Watch99,1", build: "99A999" })).toEqual({
      known: false,
      platform: "unknown",
      build: "99A999",
    });
    expect(getOsVersion({ productIdentifier: "iPad99,1", build: "99A999" })).toEqual({
      known: false,
      platform: "iPadOS",
      build: "99A999",
    });
    expect(getOsVersion({ productIdentifier: "Watch99,1", build: "23F77" })).toEqual({
      known: false,
      platform: "unknown",
      build: "23F77",
    });
  });

  it("parses beta and Rapid Security Response metadata", () => {
    expect(getOsVersion({ productIdentifier: "iPhone18,3", build: "24A5355q" })).toEqual({
      known: true,
      platform: "iOS",
      version: "27.0",
      build: "24A5355q",
      releaseChannel: "beta",
      releaseLabel: "beta 1",
    });
    expect(getOsVersion({ productIdentifier: "iPhone18,3", build: "23D771330a" })).toEqual({
      known: true,
      platform: "iOS",
      version: "26.3.1",
      build: "23D771330a",
      releaseChannel: "rapid-security-response",
      releaseLabel: "a",
    });
  });

  it("resolves every newly verified September 2026 build addition", () => {
    const additions = [
      {
        build: "22H373",
        version: "18.7.10",
        releaseChannel: "release-candidate" as const,
        releaseLabel: "release candidate",
      },
      { build: "22H374", version: "18.7.10", releaseChannel: "stable" as const },
      { build: "23G71", version: "26.6", releaseChannel: "stable" as const },
      {
        build: "23G82",
        version: "26.6.1",
        releaseChannel: "release-candidate" as const,
        releaseLabel: "release candidate",
      },
      { build: "23G83", version: "26.6.1", releaseChannel: "stable" as const },
      { build: "23G90", version: "26.6.2", releaseChannel: "stable" as const },
      {
        build: "23G5028e",
        version: "26.6",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 1",
      },
      {
        build: "23G5043d",
        version: "26.6",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 2",
      },
      {
        build: "23G5057c",
        version: "26.6",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 4",
      },
      {
        build: "23G5065a",
        version: "26.6",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 5",
      },
      { build: "23H24", version: "26.7", releaseChannel: "stable" as const },
      { build: "24A427", version: "27.0", releaseChannel: "stable" as const },
      {
        build: "24A435",
        version: "27.0",
        releaseChannel: "release-candidate" as const,
        releaseLabel: "release candidate",
      },
      { build: "24A437", version: "27.0", releaseChannel: "stable" as const },
      {
        build: "24A5380h",
        version: "27.0",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 3",
      },
      {
        build: "24A5380l",
        version: "27.0",
        platform: "iPadOS" as const,
        productIdentifier: "iPad16,6",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 3",
      },
      {
        build: "24A5390f",
        version: "27.0",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 4",
      },
      {
        build: "24A5408d",
        version: "27.0",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 5",
      },
      {
        build: "24A5418b",
        version: "27.0",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 6",
      },
      {
        build: "24A5424a",
        version: "27.0",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 7",
      },
      {
        build: "24A5430a",
        version: "27.0",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 8",
      },
      { build: "24A8428", version: "27.0", releaseChannel: "stable" as const },
      {
        build: "24B5084k",
        version: "27.2",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 1",
      },
      {
        build: "24B5089g",
        version: "27.2",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 2",
      },
    ];

    for (const addition of additions) {
      expect(
        getOsVersion({
          productIdentifier: addition.productIdentifier ?? "iPhone16,1",
          build: addition.build,
        })
      ).toEqual({
        known: true,
        platform: addition.platform ?? "iOS",
        version: addition.version,
        build: addition.build,
        releaseChannel: addition.releaseChannel,
        ...(addition.releaseLabel ? { releaseLabel: addition.releaseLabel } : {}),
      });
    }
  });

  it("keeps newly added post-iPadOS builds platform-aware for iPad identifiers", () => {
    for (const addition of [
      { build: "22H374", version: "18.7.10", releaseChannel: "stable" as const },
      {
        build: "23G82",
        version: "26.6.1",
        releaseChannel: "release-candidate" as const,
        releaseLabel: "release candidate",
      },
      { build: "23G83", version: "26.6.1", releaseChannel: "stable" as const },
      {
        build: "24A427",
        version: "27.0",
        releaseChannel: "stable" as const,
      },
      {
        build: "24A435",
        version: "27.0",
        releaseChannel: "release-candidate" as const,
        releaseLabel: "release candidate",
      },
      { build: "24A437", version: "27.0", releaseChannel: "stable" as const },
      { build: "24A8428", version: "27.0", releaseChannel: "stable" as const },
      {
        build: "24A5430a",
        version: "27.0",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 8",
      },
      {
        build: "24B5084k",
        version: "27.2",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 1",
      },
      {
        build: "24B5089g",
        version: "27.2",
        releaseChannel: "beta" as const,
        releaseLabel: "beta 2",
      },
    ]) {
      expect(getOsVersion({ productIdentifier: "iPad16,6", build: addition.build })).toEqual({
        known: true,
        platform: "iPadOS",
        version: addition.version,
        build: addition.build,
        releaseChannel: addition.releaseChannel,
        ...(addition.releaseLabel ? { releaseLabel: addition.releaseLabel } : {}),
      });
    }
  });

  it("formats known, unknown, empty, and already formatted input", () => {
    expect(formatOsVersion({ productIdentifier: "iPhone16,1", build: "23F77" })).toEqual({
      displayValue: "iOS 26.5",
      copyValue: "iOS 26.5 (23F77)",
      rawBuild: "23F77",
    });
    expect(formatOsVersion({ productIdentifier: "iPhone99,1", build: "99A999" })).toEqual({
      displayValue: "Build 99A999",
      copyValue: "99A999",
      rawBuild: "99A999",
    });
    expect(formatOsVersion({ productIdentifier: "iPhone16,1", build: "" })).toEqual({
      displayValue: "",
      copyValue: "",
    });
    expect(
      formatOsVersion({ productIdentifier: "iPhone16,1", build: "iOS 17.4.1 (21E236)" })
    ).toEqual({
      displayValue: "iOS 17.4.1",
      copyValue: "iOS 17.4.1 (21E236)",
      rawBuild: "21E236",
    });
    expect(formatOsVersion({ productIdentifier: "iPad16,6", build: "ipados 26.5" })).toEqual({
      displayValue: "iPadOS 26.5",
      copyValue: "iPadOS 26.5",
    });
  });

  it("formats beta and RSR labels without losing the build", () => {
    expect(formatOsVersion({ productIdentifier: "iPhone18,3", build: "24A5355q" })).toEqual({
      displayValue: "iOS 27.0 beta 1",
      copyValue: "iOS 27.0 beta 1 (24A5355q)",
      rawBuild: "24A5355q",
    });
    expect(formatOsVersion({ productIdentifier: "iPhone18,3", build: "23D771330a" })).toEqual({
      displayValue: "iOS 26.3.1 (a)",
      copyValue: "iOS 26.3.1 (a) (23D771330a)",
      rawBuild: "23D771330a",
    });
  });

  it("normalizes every supported catalog release label", () => {
    expect(parseCatalogVersion("27.0 beta")).toEqual({
      version: "27.0",
      releaseChannel: "beta",
      releaseLabel: "beta",
    });
    expect(parseCatalogVersion("27.0 rc")).toEqual({
      version: "27.0",
      releaseChannel: "release-candidate",
      releaseLabel: "release candidate",
    });
    expect(parseCatalogVersion("27.0 release candidate 2")).toEqual({
      version: "27.0",
      releaseChannel: "release-candidate",
      releaseLabel: "release candidate 2",
    });
    expect(parseCatalogVersion("26.5")).toEqual({
      version: "26.5",
      releaseChannel: "stable",
    });
  });
});
