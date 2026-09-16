# Catalog sources and evidence policy

The initial catalog was extracted from the open-source UDID Tools website on 2026-08-28 and
normalized into the stable `@udid-tools/device-info` API. The source website's OS build table was
generated from public iOS and iPadOS version-history tables.

## Discovery sources

The weekly discovery job currently inspects these device-identifier tables:

- <https://en.wikipedia.org/wiki/List_of_iPhone_models>
- <https://en.wikipedia.org/wiki/List_of_iPad_models>

It discovers exact iOS and iPadOS build/version pairs from AppleDB's structured firmware API:

- <https://api.appledb.dev/ios/iOS/main.json>
- <https://github.com/littlebyteorg/appledb/blob/main/API.md>

The iOS and iPadOS Wikipedia version-history pages remain useful human-readable summaries, but
they no longer expose exact build numbers in their rendered tables and are therefore not used for
automated build discovery:

- <https://en.wikipedia.org/wiki/IOS_version_history>
- <https://en.wikipedia.org/wiki/IPadOS_version_history>

These pages are discovery sources, not evidence of vendor endorsement. Automated matches are
unverified candidates until a maintainer reviews the exact row and supporting references. The
source formats and availability were last checked on 2026-09-14.

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

## 2026-09-16 catalog update evidence

Accessed on 2026-09-16 for the verified OS-build additions in this repository update:

- `22H373` → `18.7.10 release candidate` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/22x%20-%2018.x/22H373.json>
- `22H374` → `18.7.10` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/22x%20-%2018.x/22H374.json>
- `23G71` → `26.6` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/23x%20-%2026.x/23G71.json>
- `23G82` → `26.6.1 release candidate` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/23x%20-%2026.x/23G82.json>
- `23G83` → `26.6.1` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/23x%20-%2026.x/23G83.json>
- `23G90` → `26.6.2` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/23x%20-%2026.x/23G90.json>
- `23G5028e` → `26.6 beta 1` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/23x%20-%2026.x/23G5028e.json>
- `23G5043d` → `26.6 beta 2` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/23x%20-%2026.x/23G5043d.json>
- `23G5057c` → `26.6 beta 4` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/23x%20-%2026.x/23G5057c.json>
- `23G5065a` → `26.6 beta 5` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/23x%20-%2026.x/23G5065a.json>
- `23H24` → `26.7` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/23x%20-%2026.x/23H24.json>
- `24A435` → `27.0 release candidate` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/24x%20-%2027.x/24A435.json>
- `24A437` → `27.0` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/24x%20-%2027.x/24A437.json>
- `24A5380h` → `27.0 beta 3` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/24x%20-%2027.x/24A5380h.json>
- `24A5380l` → `27.0 beta 3` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iPadOS/24x%20-%2027.x/24A5380l.json>
- `24A5390f` → `27.0 beta 4` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/24x%20-%2027.x/24A5390f.json>
- `24A5408d` → `27.0 beta 5` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/24x%20-%2027.x/24A5408d.json>
- `24A5418b` → `27.0 beta 6` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/24x%20-%2027.x/24A5418b.json>
- `24A5424a` → `27.0 beta 7` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/24x%20-%2027.x/24A5424a.json>
- `24A5430a` → `27.0 beta 8` — <https://raw.githubusercontent.com/littlebyteorg/appledb/main/osFiles/iOS/24x%20-%2027.x/24A5430a.json>

Reviewed on 2026-09-16 for the discovery-only device identifiers that were not added:

- AppleDB's public iPhone device catalog exposed `iPhone19,2`, `iPhone19,3`, `iPhone19,4`, and `iPhone19,7`, but it did not provide matching public confirmation for discovery candidates `iPhone19,1` or `iPhone19,6`, so those identifiers were left out of the committed catalog pending stronger evidence: <https://github.com/littlebyteorg/appledb/tree/main/deviceFiles/iPhone>
