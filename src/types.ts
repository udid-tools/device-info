/** A supported hardware family. New families may be added in minor releases. */
export type DeviceFamily = "iPhone" | "iPad";

/** A resolved hardware product identifier. */
export interface DeviceInfo {
  readonly identifier: string;
  readonly family: DeviceFamily;
  readonly model: string;
}

/** A platform name derived from the device family and known OS version. */
export type OsPlatform = "iOS" | "iPadOS" | "unknown";

/** The release stage encoded by a known build. */
export type OsReleaseChannel = "stable" | "beta" | "release-candidate" | "rapid-security-response";

/** Input accepted by OS resolution and formatting helpers. */
export interface OsVersionInput {
  readonly productIdentifier: string;
  readonly build: string;
}

/** A known build from the package catalog. */
export interface KnownOsVersion {
  readonly known: true;
  readonly platform: Exclude<OsPlatform, "unknown">;
  readonly version: string;
  readonly build: string;
  readonly releaseChannel: OsReleaseChannel;
  readonly releaseLabel?: string;
}

/** A build that is not present in the package catalog. */
export interface UnknownOsVersion {
  readonly known: false;
  readonly platform: OsPlatform;
  readonly build: string;
}

/** The lossless result of resolving an OS build. */
export type OsVersionResolution = KnownOsVersion | UnknownOsVersion;

/** Presentation values derived from an OS build without losing the original build string. */
export interface FormattedOsVersion {
  readonly displayValue: string;
  readonly copyValue: string;
  readonly rawBuild?: string;
}
