export interface DeviceCandidate {
  identifier: string;
  model: string;
  context: string;
  source: string;
  evidence: string;
}

export interface DeviceConflict {
  identifier: string;
  appleDbModel: string;
  ipswModel: string;
  appleDbSource: string;
  ipswSource: string;
}

export interface DeviceSourceConfig {
  label: string;
  url: string;
  detailBaseUrl: string;
  detailSuffix: string;
}

export interface OsCandidate {
  build: string;
  version: string;
  context: string;
  source: string;
}

export function inspectDeviceSources(
  appleDbPayload: unknown,
  ipswPayload: unknown,
  deviceModels: Readonly<Record<string, string>>,
  sources?: { appleDb: DeviceSourceConfig; ipsw: DeviceSourceConfig }
): {
  candidates: DeviceCandidate[];
  conflicts: DeviceConflict[];
  appleDbMatchCount: number;
  ipswMatchCount: number;
  confirmedMatchCount: number;
};

export function inspectOsSource(
  payload: unknown,
  source: string,
  osBuildVersions: Readonly<Record<string, string>>,
  generatedAt: string
): { candidates: OsCandidate[]; matchCount: number };

export function normalizeAppleDbVersion(value: string): string;

export function normalizeDeviceModelName(value: string): string;
