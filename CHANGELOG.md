# Changelog

All notable changes are documented here. The project follows Semantic Versioning and publishes
stable releases under npm's `latest` distribution tag.

## [Unreleased]

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

[unreleased]: https://github.com/udid-tools/device-info/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/udid-tools/device-info/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/udid-tools/device-info/releases/tag/v1.0.0
