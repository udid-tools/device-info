# AGENTS.md

This is the durable engineering context for humans and coding agents working on
`@udid-tools/device-info`.

## Product boundary

Publish a small, framework-agnostic, ESM-only TypeScript package that resolves publicly known
Apple device product identifiers and OS build numbers. The stable public API begins at `1.0.0`.

The package does not retrieve UDIDs, inspect user agents, parse configuration profiles, perform
MDM/Profile Service work, access files or networks at runtime, log, emit telemetry, or expose a
mutable catalog. `@udid-tools/core` owns Profile Service generation and parsing.

## Stable runtime contracts

1. Runtime code has zero dependencies and works in browsers and Node.js 22.14 or newer.
2. Lookup is deterministic, offline, side-effect free, and case-sensitive after trimming outer
   whitespace.
3. Unknown devices return `undefined`; unknown builds return a discriminated `known: false`
   result and preserve the original build.
4. Public exports are only declared through `src/index.ts`.
5. Raw catalog maps remain internal.
6. Existing identifiers/builds are never removed without evidence that they are wrong.
7. Catalog additions and factual corrections are patch releases.
8. New device families and APIs require an approved feature issue and compatibility review.

## Catalog policy

- Add only public, confirmed facts. Never add rumors, leaks, guesses, or inferred future IDs.
- Preserve the vendor's exact marketing capitalization and punctuation.
- Cite sources and access dates in `SOURCES.md`.
- Discovery automation produces candidates, not truth. Every candidate requires human review.
- Catalog PRs may change only data, relevant tests, `SOURCES.md`, and `CHANGELOG.md`.
- Do not fetch source pages during build, test, installation, import, or package runtime.

## Required verification

Run with the Node/npm versions declared in `package.json`:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run verify
npm audit --audit-level=high
npm audit signatures
```

Before release, inspect the real tarball, install it in a clean consumer, verify exports, checksum,
SBOM, provenance, and exact-byte publication to npm and GitHub Packages.

## Release safety

- Follow semantic versioning from stable `1.0.0`.
- Releases are created only from protected signed `v*` tags after owner approval.
- Publish one verified tarball to both registries; never rebuild per registry.
- Copilot and dependency automation may not merge, tag, publish, or bypass CODEOWNERS.
- Never commit tokens, environment files, private device identifiers, generated candidate reports,
  package tarballs, `dist`, coverage, or docs build output.

## Trademark boundary

The product name is UDID Tools Device Info. Apple trademarks may appear only as factual,
referential compatibility terms. Do not use Apple logos, imply endorsement, or rename the product
to include an Apple trademark.
