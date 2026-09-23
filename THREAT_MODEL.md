# Threat model

## Assets

- Accuracy and provenance of device/build mappings.
- Stability of the public API and unknown-value behavior.
- Integrity of source, workflows, tags, tarballs, registry publications, and documentation.

## Threats

- A poisoned or mistaken source adds a false mapping.
- Discovery HTML changes create false candidates.
- Automation expands scope, changes APIs, merges, or publishes without owner review.
- A compromised dependency, Action, maintainer account, or registry credential alters artifacts.
- Malformed, unusual Unicode, or excessively long caller input causes exceptions or corrupt output.
- A caller mistakes an unknown value for a confirmed model/version.

## Controls

- Runtime has no dependencies or network access.
- Unknown results are explicit and lossless.
- Example-based and property-based tests exercise known, unknown, malformed, Unicode, and long
  inputs on every pull request.
- Discovery is separate from committed data and never runs during build or import.
- Sources, integrity tests, CODEOWNERS, protected branches/tags, and owner review gate changes.
- Actions are SHA-pinned; releases use checksums, SBOMs, attestations, OIDC, and one tarball for both
  registries.
- Copilot may prepare catalog-only PRs but cannot merge, tag, or publish.

Residual risk remains that public sources contain errors. Human review and correction releases
reduce but cannot eliminate that risk.
