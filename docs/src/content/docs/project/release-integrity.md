---
title: Release integrity
description: Verify checksums, Sigstore signatures, attestations, and npm provenance.
---

Official releases come only from protected, maintainer-signed annotated `v*` tags. The release
workflow builds one npm tarball, smoke-tests it as an installed consumer, and publishes those exact
bytes to npm and GitHub Packages.

Each GitHub Release contains:

- the package tarball;
- a SHA-256 checksum for the tarball;
- a CycloneDX SBOM;
- a `.sigstore.json` bundle beside every release asset.

The workflow also records a GitHub artifact attestation for the tarball. npm Trusted Publishing
adds registry provenance without a long-lived npm token.

## Verify version 1.0.1

Download the immutable release assets:

```bash
gh release download v1.0.1 --repo udid-tools/device-info --dir device-info-release
cd device-info-release
```

Verify the tarball checksum on Linux:

```bash
sha256sum --check udid-tools-device-info-1.0.1.tgz.sha256
```

On macOS, use the compatible checksum command:

```bash
shasum --algorithm 256 --check udid-tools-device-info-1.0.1.tgz.sha256
```

Verify the tarball's keyless Sigstore signature, certificate identity, and transparency-log proof:

```bash
cosign verify-blob udid-tools-device-info-1.0.1.tgz \
  --bundle udid-tools-device-info-1.0.1.tgz.sigstore.json \
  --certificate-identity \
  "https://github.com/udid-tools/device-info/.github/workflows/release.yml@refs/tags/v1.0.1" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com"
```

Repeat `cosign verify-blob` with each SBOM or checksum file and its adjacent bundle when consuming
those assets directly. Verify the GitHub artifact attestation independently:

```bash
gh attestation verify udid-tools-device-info-1.0.1.tgz \
  --repo udid-tools/device-info
```

On the npm package page, the provenance indicator must link the published version to this
repository and its protected release workflow. Treat a missing bundle, checksum mismatch,
unexpected certificate identity, failed attestation, or missing npm provenance as a release
integrity failure.
