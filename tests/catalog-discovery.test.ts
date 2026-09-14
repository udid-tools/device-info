import { describe, expect, it } from "vitest";
import {
  inspectDeviceSource,
  inspectOsSource,
  normalizeAppleDbVersion,
} from "../scripts/discover-catalog-updates.mjs";

describe("catalog discovery", () => {
  it("counts device identifiers only in rendered table text", () => {
    const html = `
      <a href="/wiki/Foo%2FiPhone99,9">not a table candidate</a>
      <table><tr><td>iPhone19,1</td><td>iPhone18,1</td></tr></table>
    `;

    expect(
      inspectDeviceSource(html, "https://example.test/devices", { "iPhone18,1": "Known" })
    ).toEqual({
      matchCount: 2,
      candidates: [
        {
          identifier: "iPhone19,1",
          context: "iPhone19,1iPhone18,1",
          source: "https://example.test/devices",
        },
      ],
    });
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
});

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
