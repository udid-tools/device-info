---
title: Versioning and releases
description: Stable API and catalog release policy.
---

The public API starts at stable `1.0.0` and follows Semantic Versioning.

- Patch: confirmed catalog additions and factual corrections.
- Minor: approved additive APIs or device families with compatibility review.
- Major: removal, rename, or incompatible behavior.

Protected maintainer-signed annotated tags trigger a workflow that verifies, builds, packs,
smoke-tests, checksums, inventories, and attests one tarball. Every release asset is keylessly
signed and verified with Sigstore. The exact tarball is published to npm and GitHub Packages before
the GitHub Release is created. See [Release integrity](./release-integrity/) for consumer
verification commands.
