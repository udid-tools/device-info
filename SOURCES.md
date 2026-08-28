# Catalog sources and evidence policy

The initial catalog was extracted from the open-source UDID Tools website on 2026-08-28 and
normalized into the stable `@udid-tools/device-info` API. The source website's OS build table was
generated from public iOS and iPadOS version-history tables.

## Discovery sources

The weekly discovery job currently inspects:

- <https://en.wikipedia.org/wiki/List_of_iPhone_models>
- <https://en.wikipedia.org/wiki/List_of_iPad_models>
- <https://en.wikipedia.org/wiki/IOS_version_history>
- <https://en.wikipedia.org/wiki/IPadOS_version_history>

These pages are discovery sources, not evidence of vendor endorsement. Automated matches are
unverified candidates until a maintainer reviews the exact row and supporting references.

## Contribution evidence

Every catalog pull request must provide a public URL that connects:

- an exact Product Identifier to an exact marketing model name; or
- an exact OS build to an exact version and release channel.

Prefer official vendor documentation where it publishes the relevant fact. When an official
source does not publish low-level identifiers, use a reputable public technical source and, when
possible, a second independent confirmation. Do not submit rumors, leaks, private device data, or
unverifiable screenshots.

Copy facts only. Do not copy article prose, images, logos, table styling, or other expressive
content into the package.
