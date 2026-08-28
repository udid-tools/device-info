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

This package is an offline lookup catalog. It does not perform network access, telemetry, file
access, profile parsing, or cryptography at runtime. Security-sensitive surfaces are package
integrity, dependency/tooling compromise, catalog poisoning, resource use, and misleading unknown
value handling.

Every release is built once, tested as a packed consumer, checksummed, attested, and published as
the same tarball to npm and GitHub Packages.
