---
title: Unknown values
description: Forward-compatible behavior for future devices and OS builds.
---

`getDevice()` returns `undefined` when the exact, case-sensitive Product Identifier is absent.
`getDeviceModelName()` behaves the same way. Callers choose their own fallback presentation.

`getOsVersion()` always preserves the trimmed build value. Its `known` discriminant prevents an
unknown build from being mistaken for a confirmed version:

```ts
const result = getOsVersion({ productIdentifier, build });
if (!result.known) {
  display(result.build);
}
```
