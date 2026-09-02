# UDID Tools Device Info

[![npm version](https://img.shields.io/npm/v/%40udid-tools%2Fdevice-info)](https://www.npmjs.com/package/@udid-tools/device-info)
[![CI](https://github.com/udid-tools/device-info/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/udid-tools/device-info/actions/workflows/ci.yml)
[![Security](https://github.com/udid-tools/device-info/actions/workflows/security.yml/badge.svg?branch=main)](https://github.com/udid-tools/device-info/actions/workflows/security.yml)
[![Coverage](https://codecov.io/gh/udid-tools/device-info/branch/main/graph/badge.svg)](https://codecov.io/gh/udid-tools/device-info)
[![Deployment](https://img.shields.io/github/actions/workflow/status/udid-tools/device-info/pages.yml?branch=main&label=deployment)](https://github.com/udid-tools/device-info/actions/workflows/pages.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/udid-tools/device-info/badge)](https://scorecard.dev/viewer/?uri=github.com/udid-tools/device-info)
[![License: MIT](https://img.shields.io/github/license/udid-tools/device-info)](./LICENSE)

`@udid-tools/device-info` is a small, framework-agnostic TypeScript catalog for resolving
hardware product identifiers and operating system build numbers for use with Apple devices.

It is ESM-only, works in browsers and Node.js, performs no network requests at runtime, and has
no runtime dependencies.

## Installation

```bash
npm install @udid-tools/device-info
```

## Resolve a device

```ts
import { getDevice, getDeviceModelName } from "@udid-tools/device-info";

getDevice("iPhone16,1");
// {
//   identifier: "iPhone16,1",
//   family: "iPhone",
//   model: "iPhone 15 Pro"
// }

getDeviceModelName("iPad16,6");
// "iPad Pro 13-inch (M4)"

getDevice("iPhone99,1");
// undefined
```

Unknown identifiers return `undefined`; they are never presented as known marketing names.

## Resolve an OS build

```ts
import { formatOsVersion, getOsVersion } from "@udid-tools/device-info";

getOsVersion({ productIdentifier: "iPhone16,1", build: "23F77" });
// {
//   known: true,
//   platform: "iOS",
//   version: "26.5",
//   build: "23F77",
//   releaseChannel: "stable"
// }

getOsVersion({ productIdentifier: "iPhone99,1", build: "99A999" });
// { known: false, platform: "iOS", build: "99A999" }

formatOsVersion({ productIdentifier: "iPhone16,1", build: "23F77" });
// {
//   displayValue: "iOS 26.5",
//   copyValue: "iOS 26.5 (23F77)",
//   rawBuild: "23F77"
// }
```

The discriminated `known` result preserves future build numbers without inventing versions.
Beta, release-candidate, and Rapid Security Response metadata is exposed explicitly.

## Supported catalog

Version 1 supports:

- iPhone product identifiers and marketing model names;
- iPad product identifiers and marketing model names;
- historical and current iOS/iPadOS build-to-version mappings;
- stable, beta, release-candidate, and Rapid Security Response builds.

The package deliberately does not detect a device from a browser user agent, retrieve a UDID,
parse configuration profiles, call external services, or expose mutable catalog maps.

Catalog additions and corrections are patch releases. New device families or public capabilities
require explicit design review and a minor or major release as appropriate. See
[SOURCES.md](./SOURCES.md) and [CONTRIBUTING.md](./CONTRIBUTING.md).

## Automated catalog watch

A weekly GitHub Action checks public reference pages for identifiers and builds that are absent
from the committed catalog. It creates a discovery issue and can assign that issue to GitHub
Copilot. Copilot may prepare a catalog-only pull request, but cannot merge, tag, or publish.
Every catalog change requires CI and owner/CODEOWNERS review.

## Security and privacy

This package processes only product identifiers and OS build strings supplied by the caller. It
does not read environment variables, files, browser globals, network resources, or telemetry.

Do not include a real UDID, serial number, IMEI, MEID, or other private device identifier in a
public issue or test fixture. See [SECURITY.md](./SECURITY.md) for private reporting.

## Documentation

Complete documentation lives in the repository's [`docs`](./docs) directory and is verified on
every change.

## License

[MIT](./LICENSE) © UDID Tools contributors.

## Trademark notice

Apple, iPhone, iPad, and iPadOS are trademarks of Apple Inc., registered in the U.S. and other
countries and regions. This project uses iOS to refer to Apple's operating system. Apple's
trademark attribution states that IOS is a trademark or registered trademark of Cisco in the U.S.
and other countries and is used under license. This independent project is not affiliated with,
endorsed by, or sponsored by Apple Inc.
