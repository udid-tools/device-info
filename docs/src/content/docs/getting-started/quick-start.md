---
title: Quick start
description: Resolve device identifiers and OS builds.
---

```ts
import { getDevice, getOsVersion } from "@udid-tools/device-info";

const device = getDevice("iPhone16,1");
if (device) console.log(device.model);

const os = getOsVersion({ productIdentifier: "iPhone16,1", build: "23F77" });
if (os.known) {
  console.log(`${os.platform} ${os.version}`);
} else {
  console.log(`Unknown build: ${os.build}`);
}
```

Unknown hardware returns `undefined`. Unknown OS builds return a lossless discriminated result
instead of throwing or inventing a version.
