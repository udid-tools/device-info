# Changelog

All notable changes are documented here. The project follows Semantic Versioning and publishes
stable releases under npm's `latest` distribution tag.

## [Unreleased]

### Fixed

- Replaced ambiguous Wikipedia hardware-string discovery with structured AppleDB device mappings
  cross-validated against IPSW.me, and made each new candidate set start a fresh Copilot task.
- Restored automated iOS and iPadOS build discovery with a structured firmware source and made
  source-health checks validate parsed records instead of URL-encoded HTML fragments.
- Made missing, expired, or rejected Copilot assignment credentials fail visibly after the
  discovery issue is created instead of silently completing without a pull request.

## [1.0.2] - 2026-09-14

### Changed

- Refreshed the verified documentation and catalog-maintenance toolchain with Astro 7.3.2,
  ESLint 10.10.0, `typedoc-plugin-frontmatter` 1.3.2, and `typescript-eslint` 8.70.0. The runtime
  API and catalog are unchanged from `1.0.1`.

### Security

- Updated the pinned CodeQL Action to 4.38.0 and its default CodeQL bundle to 2.27.0.
- Adopted Astro 7.3.2's stricter escaping for dynamic MDX `<script>` and `<style>` content.

## [1.0.1] - 2026-09-13

### Changed

- Improved the documentation layout, restored GitHub Pages deployment, standardized live npm,
  CI, security, coverage, deployment, OpenSSF, and license badges, and corrected license and
  trademark wording.
- Refreshed the verified documentation and catalog-maintenance toolchain. The runtime API and
  catalog are unchanged from `1.0.0`.

### Security

- Added a second human CODEOWNER and conventional commit and pull-request title enforcement.
- Added keyless Sigstore signatures and verification bundles for every GitHub Release asset, in
  addition to the existing checksum, CycloneDX SBOM, GitHub artifact attestation, and npm
  provenance.

## [1.0.0] - 2026-08-28

### Added

- Stable `getDevice` and `getDeviceModelName` hardware lookup API.
- Stable discriminated `getOsVersion` and presentation-focused `formatOsVersion` API.
- Historical and current iPhone/iPad model and iOS/iPadOS build catalogs extracted from the UDID
  Tools website.
- Explicit stable, beta, release-candidate, and Rapid Security Response metadata.
- Offline catalog integrity tests, documentation, issue forms, and weekly catalog discovery.
- Hardened CI, security scanning, supply-chain attestations, and dual-registry release automation.

[unreleased]: https://github.com/udid-tools/device-info/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/udid-tools/device-info/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/udid-tools/device-info/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/udid-tools/device-info/releases/tag/v1.0.0
