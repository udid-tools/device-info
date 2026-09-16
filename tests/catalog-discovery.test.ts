import { describe, expect, it } from "vitest";
import {
  inspectDeviceSources,
  inspectOsSource,
  normalizeAppleDbVersion,
  normalizeDeviceModelName,
} from "../scripts/discover-catalog-updates.mjs";

describe("catalog discovery", () => {
  it("emits exact device mappings confirmed by both structured catalogs", () => {
    const result = inspectDeviceSources(
      [
        deviceRecord("iPhone19,2", "iPhone 18 Pro"),
        deviceRecord("iPhone19,3", "iPhone 18 Pro Max (US)"),
        deviceRecord("iPhone19,4", "iPhone Duo"),
        deviceRecord("iPhone18,1", "iPhone 17 Pro"),
        deviceRecord("iPhone19,6", "iPhone Duo"),
        deviceRecord("iPad17,1", "iPad Pro 11-inch Wi-Fi (M5)"),
      ],
      [
        { identifier: "iPhone19,2", name: "iPhone 18 Pro" },
        { identifier: "iPhone19,3", name: "iPhone 18 Pro Max (U.S.)" },
        { identifier: "iPhone18,1", name: "iPhone 17 Pro" },
        { identifier: "iPhone19,6", name: "iPhone Fold" },
        { identifier: "iPhone19,7", name: "iPhone 18 Pro Max" },
        { identifier: "iPad17,1", name: "iPad Pro 11-inch (M5, WiFi)" },
      ],
      { "iPhone18,1": "iPhone 17 Pro" },
      {
        appleDb: {
          label: "AppleDB",
          url: "https://api.example.test/device/main.json",
          detailBaseUrl: "https://api.example.test/device/",
          detailSuffix: ".json",
        },
        ipsw: {
          label: "IPSW.me",
          url: "https://ipsw.example.test/v4/devices",
          detailBaseUrl: "https://ipsw.example.test/v4/device/",
          detailSuffix: "?type=ipsw",
        },
      }
    );

    expect(result).toEqual({
      appleDbMatchCount: 6,
      ipswMatchCount: 6,
      confirmedMatchCount: 5,
      candidates: [
        {
          identifier: "iPhone19,2",
          model: "iPhone 18 Pro",
          context: "AppleDB: iPhone 18 Pro; released 2026-09-18; IPSW.me: iPhone 18 Pro",
          source: "https://api.example.test/device/iPhone19%2C2.json",
          evidence: "https://ipsw.example.test/v4/device/iPhone19%2C2?type=ipsw",
        },
        {
          identifier: "iPhone19,3",
          model: "iPhone 18 Pro Max",
          context:
            "AppleDB: iPhone 18 Pro Max (US); released 2026-09-18; IPSW.me: iPhone 18 Pro Max (U.S.)",
          source: "https://api.example.test/device/iPhone19%2C3.json",
          evidence: "https://ipsw.example.test/v4/device/iPhone19%2C3?type=ipsw",
        },
        {
          identifier: "iPad17,1",
          model: "iPad Pro 11-inch (M5)",
          context:
            "AppleDB: iPad Pro 11-inch Wi-Fi (M5); released 2026-09-18; IPSW.me: iPad Pro 11-inch (M5, WiFi)",
          source: "https://api.example.test/device/iPad17%2C1.json",
          evidence: "https://ipsw.example.test/v4/device/iPad17%2C1?type=ipsw",
        },
      ],
      conflicts: [
        {
          identifier: "iPhone19,6",
          appleDbModel: "iPhone Duo",
          ipswModel: "iPhone Fold",
          appleDbSource: "https://api.example.test/device/iPhone19%2C6.json",
          ipswSource: "https://ipsw.example.test/v4/device/iPhone19%2C6?type=ipsw",
        },
      ],
    });
  });

  it("normalizes regional and connectivity variants to catalog model names", () => {
    expect(normalizeDeviceModelName("iPhone 18 Pro Max (U.S.)")).toBe("iPhone 18 Pro Max");
    expect(normalizeDeviceModelName("iPhone 18 Pro Max (Global)")).toBe("iPhone 18 Pro Max");
    expect(normalizeDeviceModelName("iPad Pro 11-inch Wi-Fi (M5)")).toBe("iPad Pro 11-inch (M5)");
    expect(normalizeDeviceModelName("iPad Air 13-inch (M4) Wi-Fi + Cellular")).toBe(
      "iPad Air 13-inch (M4)"
    );
    expect(normalizeDeviceModelName("iPad Pro 11-inch (M5, Cellular)")).toBe(
      "iPad Pro 11-inch (M5)"
    );
    expect(normalizeDeviceModelName("iPad Pro (M4, 13-inch, WiFi)")).toBe("iPad Pro 13-inch (M4)");
  });

  it("discovers current device OS builds without historical, future, or simulator noise", () => {
    const records = [
      osRecord({ osStr: "iOS", version: "18.7.10", build: "22H374" }),
      osRecord({ osStr: "iPadOS", version: "18.7.10", build: "22H374" }),
      osRecord({ osStr: "iOS", version: "26.6 RC", build: "23G71", rc: true }),
      osRecord({ osStr: "iOS", version: "26.6", build: "23G71" }),
      osRecord({ osStr: "iOS", version: "27.0 beta 3", build: "24A5380h", beta: true }),
      osRecord({ osStr: "iOS", version: "18.7.8", build: "22H350" }),
      osRecord({
        osStr: "iOS",
        version: "13.7 beta",
        build: "17H33",
        released: "2020-08-26",
        beta: true,
      }),
      osRecord({ version: "27.0", build: "24A427", released: "2026-09-18" }),
      osRecord({ version: "27.0 Simulator", build: "24A434", deviceMap: ["iOS Simulator"] }),
      { version: "27.0", build: "not-a-build" },
    ];

    const result = inspectOsSource(
      records,
      "https://api.example.test/os.json",
      {
        "22H355": "18.7.9",
        "23G5052d": "26.6 beta 3",
        "24A5370h": "27.0 beta 2",
        "17H35": "13.7",
      },
      "2026-09-14T12:00:00.000Z"
    );

    expect(result.matchCount).toBe(7);
    expect(result.candidates).toEqual([
      {
        build: "22H374",
        version: "18.7.10",
        context: "iOS 18.7.10; released 2026-09-14; stable",
        source: "https://appledb.example.test/22H374",
      },
      {
        build: "23G71",
        version: "26.6",
        context: "iOS 26.6; released 2026-09-14; stable",
        source: "https://appledb.example.test/23G71",
      },
      {
        build: "24A5380h",
        version: "27.0 beta 3",
        context: "iOS 27.0 beta 3; released 2026-09-14; beta",
        source: "https://appledb.example.test/24A5380h",
      },
    ]);
  });

  it("normalizes AppleDB preview channel names for the catalog", () => {
    expect(normalizeAppleDbVersion("27.0 beta")).toBe("27.0 beta 1");
    expect(normalizeAppleDbVersion("27.0 RC 2")).toBe("27.0 release candidate 2");
    expect(normalizeAppleDbVersion("5.0 GM")).toBe("5.0 release candidate");
  });

  it("rejects an unexpected AppleDB response", () => {
    expect(() =>
      inspectOsSource({}, "https://api.example.test/os.json", {}, "2026-09-14T12:00:00.000Z")
    ).toThrow("AppleDB returned an unexpected response");
  });

  it("rejects unexpected structured device responses", () => {
    expect(() => inspectDeviceSources({}, [], {})).toThrow(
      "AppleDB returned an unexpected response"
    );
    expect(() => inspectDeviceSources([], {}, {})).toThrow(
      "IPSW.me returned an unexpected response"
    );
  });
});

function deviceRecord(identifier: string, name: string): Record<string, unknown> {
  return { identifier: [identifier], name, released: "2026-09-18" };
}

function osRecord(overrides: Record<string, unknown>): Record<string, unknown> {
  const build = typeof overrides["build"] === "string" ? overrides["build"] : "24A437";
  return {
    osStr: "iOS",
    version: "27.0",
    build,
    released: "2026-09-14",
    beta: false,
    rc: false,
    deviceMap: ["iPhone19,1"],
    appledburl: `https://appledb.example.test/${build}`,
    ...overrides,
  };
}
