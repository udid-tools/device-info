import { DEVICE_MODELS } from "./data/device-models.js";
import type { DeviceFamily, DeviceInfo } from "./types.js";

function getFamily(identifier: string): DeviceFamily | undefined {
  if (identifier.startsWith("iPhone")) return "iPhone";
  if (identifier.startsWith("iPad")) return "iPad";
  return undefined;
}

/** Resolve an exact Apple product identifier to structured device information. */
export function getDevice(productIdentifier: string): DeviceInfo | undefined {
  const identifier = productIdentifier.trim();
  const model = DEVICE_MODELS[identifier];
  const family = getFamily(identifier);

  if (!model || !family) return undefined;
  return { identifier, family, model };
}

/** Resolve an exact Apple product identifier to its marketing model name. */
export function getDeviceModelName(productIdentifier: string): string | undefined {
  return getDevice(productIdentifier)?.model;
}
