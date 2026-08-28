---
title: Catalog and sources
description: Scope, evidence, and update policy for device and OS build facts.
---

The 1.x catalog supports iPhone and iPad Product Identifiers plus iOS/iPadOS build numbers.
Marketing names, build versions, and release channels are committed data; runtime never downloads
updates.

Weekly automation scans public reference pages for values absent from the catalog. Matches are
only candidates. A catalog maintainer or Copilot can prepare a pull request, but owner review and
all CI checks are mandatory.

See the repository's `SOURCES.md` for current discovery sources and contribution evidence rules.
