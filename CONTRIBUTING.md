# Contributing

Thank you for improving UDID Tools Device Info.

## Before opening a change

- Search existing issues and the committed catalog.
- Use the dedicated issue form for device additions, OS builds, new families, or features.
- Never publish a real UDID, serial number, IMEI, MEID, token, or other private identifier.
- Read [SOURCES.md](./SOURCES.md) before changing catalog facts.

## Development

Use Node.js 24.19.0 from `.nvmrc` and npm 11.19.0 from `package.json` for development and
documentation tooling. The published package continues to support Node.js 22.14.0 and newer;
CI tests that runtime minimum separately:

```bash
nvm use
npm install --global npm@11.19.0 --ignore-scripts --no-audit --no-fund
npm ci --ignore-scripts --no-audit --no-fund
npm run verify
```

Tests must cover known values, unknown forward-compatible values, formatting, and catalog
integrity. Update documentation and the Unreleased changelog in the same pull request.

## Catalog changes

A catalog addition must include the exact identifier/build, normalized model/version, release
channel, public sources, and access date. Catalog changes do not change APIs, workflows,
dependencies, supported families, or package versions.

## Public API changes

Open a feature issue first. Additive APIs and new device families require compatibility, bundle
size, documentation, and maintenance review. Renames, removals, or behavioral changes require a
major version and migration guidance.

Only maintainers create tags and releases. Pull requests, Copilot, and bots never publish.
