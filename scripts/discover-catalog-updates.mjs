import { writeFile } from "node:fs/promises";
import process from "node:process";
import { pathToFileURL, URL, URLSearchParams } from "node:url";
import { load } from "cheerio";

const USER_AGENT =
  "UDIDToolsDeviceInfoCatalog/1.0 (+https://github.com/udid-tools/device-info; hello@udid.tools)";
const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";
const APPLEDB_OS_API = "https://api.appledb.dev/ios/iOS/main.json";
const MINIMUM_DEVICE_MATCHES = 5;
const MINIMUM_OS_RECORDS = 100;
const BUILD_PATTERN = /^\d{1,2}[A-Z]\d{1,8}[a-z]?$/;
const DEVICE_IDENTIFIER_PATTERN = /^(?:iPhone|iPad)\d+,\d+$/;
const DEVICE_IDENTIFIER_SEARCH_PATTERN = /(?:iPhone|iPad)\d+,\d+/g;
const NUMERIC_VERSION_PATTERN = /^\d+(?:\.\d+){0,2}/;
const DEVICE_SOURCES = [
  {
    kind: "device",
    page: "List_of_iPhone_models",
    url: "https://en.wikipedia.org/wiki/List_of_iPhone_models",
  },
  {
    kind: "device",
    page: "List_of_iPad_models",
    url: "https://en.wikipedia.org/wiki/List_of_iPad_models",
  },
];
const OS_SOURCE = {
  kind: "os",
  url: APPLEDB_OS_API,
};

function optionValue(name) {
  const prefix = `--${name}=`;
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

function normalizeText(value) {
  return value
    .replace(/\[[^\]]*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchJson(url, label) {
  const response = await globalThis.fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${label} returned ${response.status}`);
  return response.json();
}

async function fetchWikipediaPageHtml(page) {
  const url = new URL(WIKIPEDIA_API);
  url.search = new URLSearchParams({
    action: "parse",
    format: "json",
    origin: "*",
    page,
    prop: "text",
  }).toString();

  const payload = await fetchJson(url, `Wikipedia page ${page}`);
  const html =
    typeof payload?.parse?.text === "string"
      ? payload.parse.text
      : typeof payload?.parse?.text?.["*"] === "string"
        ? payload.parse.text["*"]
        : undefined;
  if (!html) throw new Error(`Wikipedia returned an unexpected response for ${page}`);
  return html;
}

export function inspectDeviceSource(html, source, deviceModels) {
  const $ = load(html);
  const candidates = [];
  let matchCount = 0;

  $("tr").each((_, row) => {
    const context = normalizeText($(row).text());
    const identifiers = new Set(context.match(DEVICE_IDENTIFIER_SEARCH_PATTERN) ?? []);
    matchCount += identifiers.size;
    for (const identifier of identifiers) {
      if (!(identifier in deviceModels)) {
        candidates.push({ identifier, context: context.slice(0, 800), source });
      }
    }
  });
  return { candidates, matchCount };
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
      lines.push(`- \`${item.identifier}\` — [source](${item.source})`, `  - ${item.context}`);
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
    "- Verify every candidate and discard navigation, footnote, rumor, and unrelated-platform matches.",
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
  const deviceCandidates = [];
  const observations = [];

  for (const source of DEVICE_SOURCES) {
    const html = await fetchWikipediaPageHtml(source.page);
    const inspection = inspectDeviceSource(html, source.url, DEVICE_MODELS);
    if (inspection.matchCount < MINIMUM_DEVICE_MATCHES) {
      throw new Error(
        `Source structure check failed for ${source.url}: only ${inspection.matchCount} matches`
      );
    }
    observations.push({ kind: source.kind, source: source.url, matchCount: inspection.matchCount });
    deviceCandidates.push(...inspection.candidates);
  }

  const osPayload = await fetchJson(OS_SOURCE.url, "AppleDB");
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
    sources: [...DEVICE_SOURCES.map(({ url }) => url), OS_SOURCE.url],
    observations,
    devices: uniqueBy(deviceCandidates, "identifier"),
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
