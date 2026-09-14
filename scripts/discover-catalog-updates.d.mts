export interface DeviceCandidate {
  identifier: string;
  context: string;
  source: string;
}

export interface OsCandidate {
  build: string;
  version: string;
  context: string;
  source: string;
}

export function inspectDeviceSource(
  html: string,
  source: string,
  deviceModels: Readonly<Record<string, string>>
): { candidates: DeviceCandidate[]; matchCount: number };

export function inspectOsSource(
  payload: unknown,
  source: string,
  osBuildVersions: Readonly<Record<string, string>>,
  generatedAt: string
): { candidates: OsCandidate[]; matchCount: number };

export function normalizeAppleDbVersion(value: string): string;
