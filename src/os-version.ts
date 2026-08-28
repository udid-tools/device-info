import { OS_BUILD_VERSIONS } from "./data/os-builds.js";
import type {
  FormattedOsVersion,
  KnownOsVersion,
  OsPlatform,
  OsReleaseChannel,
  OsVersionInput,
  OsVersionResolution,
} from "./types.js";

const FORMATTED_VERSION_PATTERN = /^(iOS|iPadOS)\s+(\d+(?:\.\d+){0,2})(?:\s+\(([^)]+)\))?$/i;
const BETA_PATTERN = /^(\d+(?:\.\d+){0,2})\s+beta(?:\s+(\d+))?$/i;
const RC_PATTERN = /^(\d+(?:\.\d+){0,2})\s+(?:release candidate|rc)(?:\s+(\d+))?$/i;
const RSR_PATTERN = /^(\d+(?:\.\d+){0,2})\s+\(([a-z])\)$/i;

function getPlatform(productIdentifier: string, version?: string): OsPlatform {
  if (productIdentifier.startsWith("iPhone")) return "iOS";
  if (!productIdentifier.startsWith("iPad")) return "unknown";
  if (!version) return "iPadOS";

  const [major = 0, minor = 0] = version.split(".").map((part) => Number(part));
  return major > 13 || (major === 13 && minor >= 1) ? "iPadOS" : "iOS";
}

/** @internal */
export function parseCatalogVersion(value: string): {
  version: string;
  releaseChannel: OsReleaseChannel;
  releaseLabel?: string;
} {
  const beta = BETA_PATTERN.exec(value);
  if (beta?.[1]) {
    return {
      version: beta[1],
      releaseChannel: "beta",
      ...(beta[2] ? { releaseLabel: `beta ${beta[2]}` } : { releaseLabel: "beta" }),
    };
  }

  const releaseCandidate = RC_PATTERN.exec(value);
  if (releaseCandidate?.[1]) {
    return {
      version: releaseCandidate[1],
      releaseChannel: "release-candidate",
      ...(releaseCandidate[2]
        ? { releaseLabel: `release candidate ${releaseCandidate[2]}` }
        : { releaseLabel: "release candidate" }),
    };
  }

  const rapidSecurityResponse = RSR_PATTERN.exec(value);
  if (rapidSecurityResponse?.[1] && rapidSecurityResponse[2]) {
    return {
      version: rapidSecurityResponse[1],
      releaseChannel: "rapid-security-response",
      releaseLabel: rapidSecurityResponse[2],
    };
  }

  return { version: value, releaseChannel: "stable" };
}

/** Resolve an exact OS build number while preserving unknown future builds. */
export function getOsVersion(input: OsVersionInput): OsVersionResolution {
  const productIdentifier = input.productIdentifier.trim();
  const build = input.build.trim();
  const catalogVersion = OS_BUILD_VERSIONS[build];

  if (!catalogVersion) {
    return { known: false, platform: getPlatform(productIdentifier), build };
  }

  const parsed = parseCatalogVersion(catalogVersion);
  const platform = getPlatform(productIdentifier, parsed.version);
  if (platform === "unknown") {
    return { known: false, platform, build };
  }

  return {
    known: true,
    platform,
    version: parsed.version,
    build,
    releaseChannel: parsed.releaseChannel,
    ...(parsed.releaseLabel ? { releaseLabel: parsed.releaseLabel } : {}),
  } satisfies KnownOsVersion;
}

/** Format a build for display and copying while preserving the original build value. */
export function formatOsVersion(input: OsVersionInput): FormattedOsVersion {
  const build = input.build.trim();
  if (!build) return { displayValue: "", copyValue: "" };

  const formattedVersion = FORMATTED_VERSION_PATTERN.exec(build);
  if (formattedVersion?.[1] && formattedVersion[2]) {
    const platform = formattedVersion[1].toLowerCase() === "ipados" ? "iPadOS" : "iOS";
    const displayValue = `${platform} ${formattedVersion[2]}`;
    const rawBuild = formattedVersion[3];
    return {
      displayValue,
      copyValue: rawBuild ? `${displayValue} (${rawBuild})` : displayValue,
      ...(rawBuild ? { rawBuild } : {}),
    };
  }

  const resolved = getOsVersion(input);
  if (!resolved.known) {
    return { displayValue: `Build ${build}`, copyValue: build, rawBuild: build };
  }

  const suffix = resolved.releaseLabel
    ? resolved.releaseChannel === "rapid-security-response"
      ? ` (${resolved.releaseLabel})`
      : ` ${resolved.releaseLabel}`
    : "";
  const displayValue = `${resolved.platform} ${resolved.version}${suffix}`;
  return { displayValue, copyValue: `${displayValue} (${build})`, rawBuild: build };
}
