import { writeFile } from "node:fs/promises";
import process from "node:process";
import { URL, URLSearchParams } from "node:url";
import { load } from "cheerio";
import { DEVICE_MODELS } from "../dist/data/device-models.js";
import { OS_BUILD_VERSIONS } from "../dist/data/os-builds.js";

const USER_AGENT =
  "UDIDToolsDeviceInfoCatalog/1.0 (+https://github.com/udid-tools/device-info; hello@udid.tools)";
const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";
const SOURCES = [
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
  {
    kind: "os",
    page: "iOS_version_history",
    url: "https://en.wikipedia.org/wiki/IOS_version_history",
  },
  {
    kind: "os",
    page: "iPadOS_version_history",
    url: "https://en.wikipedia.org/wiki/IPadOS_version_history",
  },
];

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

async function fetchPageHtml(page) {
  const url = new URL(WIKIPEDIA_API);
  url.search = new URLSearchParams({
    action: "parse",
    format: "json",
    origin: "*",
    page,
    prop: "text",
  }).toString();

  const response = await globalThis.fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`Wikipedia returned ${response.status} for ${page}`);

  const payload = await response.json();
  const html =
    typeof payload?.parse?.text === "string"
      ? payload.parse.text
      : typeof payload?.parse?.text?.["*"] === "string"
        ? payload.parse.text["*"]
        : undefined;
  if (!html) {
    throw new Error(`Wikipedia returned an unexpected response for ${page}`);
  }
  return html;
}

function collectDeviceCandidates(html, source) {
  const $ = load(html);
  const candidates = [];

  $("tr").each((_, row) => {
    const context = normalizeText($(row).text());
    const identifiers = new Set(context.match(/\b(?:iPhone|iPad)\d+,\d+\b/g) ?? []);
    for (const identifier of identifiers) {
      if (!(identifier in DEVICE_MODELS)) {
        candidates.push({ identifier, context: context.slice(0, 800), source });
      }
    }
  });
  return candidates;
}

function collectOsCandidates(html, source) {
  const $ = load(html);
  const candidates = [];

  $("tr").each((_, row) => {
    const context = normalizeText($(row).text());
    const builds = new Set(context.match(/\b\d{1,2}[A-Z]\d{1,8}[a-z]?\b/g) ?? []);
    for (const build of builds) {
      if (!(build in OS_BUILD_VERSIONS)) {
        candidates.push({ build, context: context.slice(0, 800), source });
      }
    }
  });
  return candidates;
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
      lines.push(`- \`${item.build}\` — [source](${item.source})`, `  - ${item.context}`);
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

const deviceCandidates = [];
const osCandidates = [];
const observations = [];

for (const source of SOURCES) {
  const html = await fetchPageHtml(source.page);
  const matches =
    source.kind === "device"
      ? html.match(/\b(?:iPhone|iPad)\d+,\d+\b/g)
      : html.match(/\b\d{1,2}[A-Z]\d{1,8}[a-z]?\b/g);
  const matchCount = matches?.length ?? 0;
  if (matchCount < 5) {
    throw new Error(`Source structure check failed for ${source.url}: only ${matchCount} matches`);
  }
  observations.push({ kind: source.kind, source: source.url, matchCount });

  if (source.kind === "device") {
    deviceCandidates.push(...collectDeviceCandidates(html, source.url));
  } else {
    osCandidates.push(...collectOsCandidates(html, source.url));
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  sources: SOURCES.map(({ url }) => url),
  observations,
  devices: uniqueBy(deviceCandidates, "identifier"),
  osBuilds: uniqueBy(osCandidates, "build"),
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
