# Catalog sources and evidence policy

The initial catalog was extracted from the open-source UDID Tools website on 2026-08-28 and
normalized into the stable `@udid-tools/device-info` API. The source website's OS build table was
generated from public iOS and iPadOS version-history tables.

## Discovery sources

The weekly discovery job joins two structured device catalogs:

- AppleDB's exact device identifier/name records: <https://api.appledb.dev/device/main.json>
- IPSW.me's firmware-backed device index: <https://api.ipsw.me/v4/devices>

A device becomes a candidate only when both sources publish the exact Product Identifier. AppleDB
supplies the model name, while IPSW.me independently confirms that the identifier has public
firmware metadata. The source names must agree after regional suffixes such as `US`, `U.S.`, or
`Global` and iPad connectivity/capacity variants are normalized to the shared marketing model
name. A disagreement is reported but never becomes a catalog candidate.

It discovers exact iOS and iPadOS build/version pairs from AppleDB's structured firmware API:

- <https://api.appledb.dev/ios/iOS/main.json>
- <https://github.com/littlebyteorg/appledb/blob/main/API.md>

Wikipedia's device and OS version-history pages remain useful human-readable summaries, but their
rendered tables can lag structured firmware catalogs or combine model headings and hardware
strings ambiguously. They are therefore not used for automated catalog discovery:

- <https://en.wikipedia.org/wiki/List_of_iPhone_models>
- <https://en.wikipedia.org/wiki/List_of_iPad_models>
- <https://en.wikipedia.org/wiki/IOS_version_history>
- <https://en.wikipedia.org/wiki/IPadOS_version_history>

These pages and APIs are factual references, not evidence of vendor endorsement. Automated
matches remain candidates until the assigned catalog maintainer verifies the linked records. The
source formats and availability were last checked on 2026-09-16.

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
