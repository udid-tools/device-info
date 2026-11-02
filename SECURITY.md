# Security policy

## Supported versions

| Version           | Supported   |
| ----------------- | ----------- |
| 1.x               | Yes         |
| Unreleased `main` | Best effort |

## Reporting

Report suspected vulnerabilities privately through
[GitHub Private Vulnerability Reporting](https://github.com/udid-tools/device-info/security/advisories/new).
Do not open a public issue containing exploit details, tokens, private device identifiers, or
confidential data.

We aim to acknowledge a complete report within three business days and provide an initial triage
within seven business days. These are best-effort targets, not guarantees. For publicly known
medium-severity or higher vulnerabilities with an available fix, we aim to remediate within 60 days.
When a fix is published, the GitHub Security Advisory and release notes identify the affected and
fixed versions and credit the reporter when they consent.

## Security verification

Dependency review blocks newly introduced moderate-or-higher vulnerabilities. CodeQL with
security-extended queries, type-aware linting, locked-dependency audits, and registry-signature
verification run in CI and before release. Confirmed exploitable findings of medium or higher
severity must be resolved before release; suppressions require an explicit, reviewable rationale.

Property-based fuzz tests exercise arbitrary Unicode, malformed input, and long strings through the
public lookup and formatting APIs. A failing generated property blocks CI and must be fixed before
merge or release.

This package is an offline lookup catalog. It does not perform network access, telemetry, file
access, profile parsing, or cryptography at runtime. Security-sensitive surfaces are package
integrity, dependency/tooling compromise, catalog poisoning, resource use, and misleading unknown
value handling.

Every release is built once, tested as a packed consumer, checksummed, attested, and published as
the same tarball to npm and GitHub Packages. Every GitHub Release asset is keylessly signed with
Sigstore and accompanied by a verification bundle; the tarball also has npm provenance.
