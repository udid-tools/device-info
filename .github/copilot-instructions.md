# Repository instructions

This repository publishes the stable, zero-runtime-dependency `@udid-tools/device-info`
TypeScript package. Its public API resolves Apple device product identifiers and operating system
build numbers. It is independent and is not affiliated with or endorsed by Apple Inc.

- Read and follow `AGENTS.md`, `CONTRIBUTING.md`, and `SOURCES.md` before editing.
- Treat catalog data as externally sourced facts: cite evidence and never add rumors or inferred IDs.
- Do not rename, remove, or repurpose a public export in a catalog update.
- Do not change workflows, package versions, release settings, or supported families in a catalog PR.
- Keep runtime code offline, deterministic, framework-agnostic, ESM-only, and dependency-free.
- Run `npm run verify` before marking work ready for review.
- Never merge, tag, publish, or bypass required owner review.
