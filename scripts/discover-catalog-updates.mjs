import { writeFile } from "node:fs/promises";
import process from "node:process";
import { pathToFileURL } from "node:url";

const USER_AGENT =
  "UDIDToolsDeviceInfoCatalog/1.0 (+https://github.com/udid-tools/device-info; hello@udid.tools)";
const APPLEDB_DEVICE_API = "https://api.appledb.dev/device/main.json";
const IPSW_DEVICE_API = "https://api.ipsw.me/v4/devices";
const APPLEDB_OS_API = "https://api.appledb.dev/ios/iOS/main.json";
const MINIMUM_DEVICE_RECORDS = 100;
const MINIMUM_OS_RECORDS = 100;
const BUILD_PATTERN = /^\d{1,2}[A-Z]\d{1,8}[a-z]?$/;
const DEVICE_IDENTIFIER_PATTERN = /^(?:iPhone|iPad)\d+,\d+$/;
const NUMERIC_VERSION_PATTERN = /^\d+(?:\.\d+){0,2}/;
const DEVICE_SOURCES = {
  appleDb: {
    kind: "device-primary",
    label: "AppleDB",
    url: APPLEDB_DEVICE_API,
    detailBaseUrl: "https://api.appledb.dev/device/",
    detailSuffix: ".json",
  },
  ipsw: {
    kind: "device-evidence",
    label: "IPSW.me",
    url: IPSW_DEVICE_API,
    detailBaseUrl: "https://api.ipsw.me/v4/device/",
    detailSuffix: "?type=ipsw",
  },
};
const OS_SOURCE = {
  kind: "os",
  url: APPLEDB_OS_API,
};

function optionValue(name) {
  const prefix = `--${name}=`;
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

async function fetchJson(url, label) {
  const response = await globalThis.fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${label} returned ${response.status}`);
  return response.json();
}

export function normalizeDeviceModelName(value) {
  return value
    .replace(/\s+/g, " ")
    .replace(/ Wi-Fi(?: \+ (?:Cellular|3G))?/g, "")
    .replace(/, (?:Cellular|WiFi|1TB Model)(?=\))/g, "")
    .replace(/ \((?:Cellular|WiFi)\)$/, "")
    .replace(/\((M\d+), (\d+(?:\.\d+)?-inch)\)/, "$2 ($1)")
    .replace(
      / \((?:CDMA|GSM(?:, \d{4})?|China|China mainland|Global|MM|TD-LTE|US|U\.S\.|VZ|\d+(?:GB|TB)|Mid \d{4})\)$/,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

function deviceDetailUrl(source, identifier) {
  return `${source.detailBaseUrl}${encodeURIComponent(identifier)}${source.detailSuffix}`;
}

function indexDeviceSource(payload, source) {
  if (!Array.isArray(payload)) {
    throw new Error(`${source.label} returned an unexpected response for ${source.url}`);
  }

  const records = new Map();
  let matchCount = 0;

  for (const record of payload) {
    if (record === null || typeof record !== "object" || typeof record.name !== "string") continue;
    const identifiers = Array.isArray(record.identifier)
      ? record.identifier
      : typeof record.identifier === "string"
        ? [record.identifier]
        : [];

    for (const identifier of identifiers) {
      if (typeof identifier !== "string" || !DEVICE_IDENTIFIER_PATTERN.test(identifier)) continue;
      matchCount += 1;
      const model = normalizeDeviceModelName(record.name);
      if (!model.startsWith(identifier.startsWith("iPhone") ? "iPhone" : "iPad")) continue;

      const candidate = {
        identifier,
        model,
        rawName: record.name,
        released: typeof record.released === "string" ? record.released : undefined,
        source: deviceDetailUrl(source, identifier),
      };
      const existing = records.get(identifier);
      if (existing && existing.model !== candidate.model) {
        throw new Error(
          `${source.label} maps ${identifier} to conflicting models: ${existing.rawName} and ${candidate.rawName}`
        );
      }
      if (!existing) records.set(identifier, candidate);
    }
  }

  return { records, matchCount };
}

export function inspectDeviceSources(
  appleDbPayload,
  ipswPayload,
  deviceModels,
  sources = DEVICE_SOURCES
) {
  const appleDb = indexDeviceSource(appleDbPayload, sources.appleDb);
  const ipsw = indexDeviceSource(ipswPayload, sources.ipsw);
  const candidates = [];
  const conflicts = [];
  let confirmedMatchCount = 0;

  for (const [identifier, primary] of appleDb.records) {
    const evidence = ipsw.records.get(identifier);
    if (!evidence) continue;
    confirmedMatchCount += 1;
    if (identifier in deviceModels) continue;

    if (primary.model !== evidence.model) {
      conflicts.push({
        identifier,
        appleDbModel: primary.rawName,
        ipswModel: evidence.rawName,
        appleDbSource: primary.source,
        ipswSource: evidence.source,
      });
      continue;
    }

    candidates.push({
      identifier,
      model: primary.model,
      context: [
        `AppleDB: ${primary.rawName}${primary.released ? `; released ${primary.released}` : ""}`,
        `IPSW.me: ${evidence.rawName}`,
      ].join("; "),
      source: primary.source,
      evidence: evidence.source,
    });
  }

  return {
    candidates,
    conflicts,
    appleDbMatchCount: appleDb.matchCount,
    ipswMatchCount: ipsw.matchCount,
    confirmedMatchCount,
  };
}

function numericVersion(value) {
  return value.match(NUMERIC_VERSION_PATTERN)?.[0];
}

function compareNumericVersions(left, right) {
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

function catalogFrontiers(osBuildVersions) {
  const frontiers = new Map();
  for (const catalogVersion of Object.values(osBuildVersions)) {
    const version = numericVersion(catalogVersion);
    if (!version) continue;
    const major = version.split(".")[0];
    const current = frontiers.get(major);
    if (!current || compareNumericVersions(version, current) > 0) frontiers.set(major, version);
  }
  return frontiers;
}

export function normalizeAppleDbVersion(value) {
  return value
    .replace(/ GM(?= |$)/, " release candidate")
    .replace(/ RC(?= |$)/, " release candidate")
    .replace(/ beta$/, " beta 1");
}

function recordPriority(record) {
  if (record.beta === true) return 1;
  if (record.rc === true) return 2;
  return 3;
}

function validReleaseDate(value, currentDate) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && value <= currentDate;
}

function oneYearBefore(generatedAt) {
  const date = new Date(generatedAt);
  if (Number.isNaN(date.valueOf())) throw new Error(`Invalid report timestamp: ${generatedAt}`);
  date.setUTCFullYear(date.getUTCFullYear() - 1);
  return date.toISOString().slice(0, 10);
}

function hasSupportedDevice(record) {
  return (
    Array.isArray(record.deviceMap) &&
    record.deviceMap.some(
      (identifier) => typeof identifier === "string" && DEVICE_IDENTIFIER_PATTERN.test(identifier)
    )
  );
}

function isEligibleOsRecord(record, currentDate) {
  return (
    record !== null &&
    typeof record === "object" &&
    (record.osStr === "iOS" || record.osStr === "iPadOS") &&
    typeof record.version === "string" &&
    numericVersion(record.version) !== undefined &&
    !/(?:Simulator|SDK)/i.test(record.version) &&
    typeof record.build === "string" &&
    BUILD_PATTERN.test(record.build) &&
    validReleaseDate(record.released, currentDate) &&
    hasSupportedDevice(record)
  );
}

export function inspectOsSource(payload, source, osBuildVersions, generatedAt) {
  if (!Array.isArray(payload))
    throw new Error(`AppleDB returned an unexpected response for ${source}`);

  const currentDate = generatedAt.slice(0, 10);
  const sameVersionHorizon = oneYearBefore(generatedAt);
  const frontiers = catalogFrontiers(osBuildVersions);
  const eligibleRecords = payload.filter((record) => isEligibleOsRecord(record, currentDate));
  const candidatesByBuild = new Map();

  for (const record of eligibleRecords) {
    if (record.build in osBuildVersions) continue;

    const version = numericVersion(record.version);
    const major = version.split(".")[0];
    const frontier = frontiers.get(major);
    if (frontier) {
      const comparison = compareNumericVersions(version, frontier);
      if (comparison < 0 || (comparison === 0 && record.released < sameVersionHorizon)) continue;
    }

    const normalizedVersion = normalizeAppleDbVersion(record.version);
    const channel =
      record.rc === true ? "release candidate" : record.beta === true ? "beta" : "stable";
    const candidate = {
      build: record.build,
      version: normalizedVersion,
      context: `${record.osStr} ${normalizedVersion}; released ${record.released}; ${channel}`,
      source:
        typeof record.appledburl === "string" && record.appledburl.startsWith("https://")
          ? record.appledburl
          : source,
      priority: recordPriority(record),
    };
    const existing = candidatesByBuild.get(candidate.build);
    if (!existing || candidate.priority > existing.priority) {
      candidatesByBuild.set(candidate.build, candidate);
    } else if (candidate.priority === existing.priority && candidate.version !== existing.version) {
      throw new Error(
        `AppleDB maps ${candidate.build} to conflicting versions: ${existing.version} and ${candidate.version}`
      );
    }
  }

  const candidates = [...candidatesByBuild.values()].map((candidate) => ({
    build: candidate.build,
    version: candidate.version,
    context: candidate.context,
    source: candidate.source,
  }));
  return { candidates, matchCount: eligibleRecords.length };
}

function uniqueBy(items, key) {
  return [...new Map(items.map((item) => [item[key], item])).values()].sort((left, right) =>
    left[key].localeCompare(right[key], "en", { numeric: true })
  );
}

function markdownReport(report) {
  const lines = [
    "## Automated catalog discovery",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "This report contains discovery candidates, not verified catalog entries. Every value must be",
    "confirmed against its source and the repository contribution policy before it is added.",
    "",
    `Device candidates: **${report.devices.length}**`,
    `OS build candidates: **${report.osBuilds.length}**`,
    "",
    "### Source observations",
    "",
    ...report.observations.map(
      (item) => `- ${item.kind}: **${item.matchCount}** known-format matches — ${item.source}`
    ),
    "",
  ];

  if (report.devices.length) {
    lines.push("### Device identifiers", "");
    for (const item of report.devices) {
      lines.push(
        `- \`${item.identifier}\` → \`${item.model}\` — [AppleDB](${item.source}) · [IPSW.me](${item.evidence})`,
        `  - ${item.context}`
      );
    }
    lines.push("");
  }

  if (report.deviceConflicts.length) {
    lines.push("### Deferred device-source conflicts", "");
    for (const item of report.deviceConflicts) {
      lines.push(
        `- \`${item.identifier}\` — [AppleDB](${item.appleDbSource}) says \`${item.appleDbModel}\`; [IPSW.me](${item.ipswSource}) says \`${item.ipswModel}\``,
        "  - Do not change the catalog until the structured sources agree."
      );
    }
    lines.push("");
  }

  if (report.osBuilds.length) {
    lines.push("### OS builds", "");
    for (const item of report.osBuilds) {
      lines.push(
        `- \`${item.build}\` → \`${item.version}\` — [source](${item.source})`,
        `  - ${item.context}`
      );
    }
    lines.push("");
  }

  lines.push(
    "### Required pull request work",
    "",
    "- For every device candidate, verify both structured links and add the exact identifier/model pair shown.",
    "- Do not infer identifiers, substitute sequential values, or add deferred source conflicts.",
    "- Add only confirmed public identifiers/builds to the canonical data files.",
    "- Add or update tests, `SOURCES.md`, and `CHANGELOG.md`.",
    "- Do not change the public API, workflows, package version, or supported device families.",
    "- Use the catalog update pull request template and leave the pull request for owner review.",
    ""
  );
  return lines.join("\n");
}

async function main() {
  const [{ DEVICE_MODELS }, { OS_BUILD_VERSIONS }] = await Promise.all([
    import("../dist/data/device-models.js"),
    import("../dist/data/os-builds.js"),
  ]);
  const generatedAt = new Date().toISOString();
  const observations = [];
  const [appleDbDevicePayload, ipswDevicePayload, osPayload] = await Promise.all([
    fetchJson(DEVICE_SOURCES.appleDb.url, DEVICE_SOURCES.appleDb.label),
    fetchJson(DEVICE_SOURCES.ipsw.url, DEVICE_SOURCES.ipsw.label),
    fetchJson(OS_SOURCE.url, "AppleDB"),
  ]);
  const deviceInspection = inspectDeviceSources(
    appleDbDevicePayload,
    ipswDevicePayload,
    DEVICE_MODELS
  );
  for (const { source, matchCount } of [
    { source: DEVICE_SOURCES.appleDb, matchCount: deviceInspection.appleDbMatchCount },
    { source: DEVICE_SOURCES.ipsw, matchCount: deviceInspection.ipswMatchCount },
  ]) {
    if (matchCount < MINIMUM_DEVICE_RECORDS) {
      throw new Error(
        `Source structure check failed for ${source.url}: only ${matchCount} records`
      );
    }
    observations.push({ kind: source.kind, source: source.url, matchCount });
  }

  const osInspection = inspectOsSource(osPayload, OS_SOURCE.url, OS_BUILD_VERSIONS, generatedAt);
  if (osInspection.matchCount < MINIMUM_OS_RECORDS) {
    throw new Error(
      `Source structure check failed for ${OS_SOURCE.url}: only ${osInspection.matchCount} records`
    );
  }
  observations.push({
    kind: OS_SOURCE.kind,
    source: OS_SOURCE.url,
    matchCount: osInspection.matchCount,
  });

  const report = {
    generatedAt,
    sources: [DEVICE_SOURCES.appleDb.url, DEVICE_SOURCES.ipsw.url, OS_SOURCE.url],
    observations,
    devices: uniqueBy(deviceInspection.candidates, "identifier"),
    deviceConflicts: uniqueBy(deviceInspection.conflicts, "identifier"),
    osBuilds: uniqueBy(osInspection.candidates, "build"),
  };

  const jsonOutput = `${JSON.stringify(report, null, 2)}\n`;
  const markdownOutput = `${markdownReport(report)}\n`;
  const jsonPath = optionValue("json");
  const markdownPath = optionValue("markdown");

  if (jsonPath) await writeFile(jsonPath, jsonOutput, "utf8");
  if (markdownPath) await writeFile(markdownPath, markdownOutput, "utf8");
  if (!jsonPath && !markdownPath) process.stdout.write(jsonOutput);

  if (process.argv.includes("--check") && (report.devices.length || report.osBuilds.length)) {
    process.exitCode = 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
