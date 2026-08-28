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
