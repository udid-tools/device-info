---
title: Generated API reference
description: TypeDoc reference for every public export in @udid-tools/device-info.
---

# @udid-tools/device-info

## Interfaces

### DeviceInfo

A resolved hardware product identifier.

#### Properties

##### family

> `readonly` **family**: [`DeviceFamily`](#devicefamily)

##### identifier

> `readonly` **identifier**: `string`

##### model

> `readonly` **model**: `string`

***

### FormattedOsVersion

Presentation values derived from an OS build without losing the original build string.

#### Properties

##### copyValue

> `readonly` **copyValue**: `string`

##### displayValue

> `readonly` **displayValue**: `string`

##### rawBuild?

> `readonly` `optional` **rawBuild?**: `string`

***

### KnownOsVersion

A known build from the package catalog.

#### Properties

##### build

> `readonly` **build**: `string`

##### known

> `readonly` **known**: `true`

##### platform

> `readonly` **platform**: `"iOS"` \| `"iPadOS"`

##### releaseChannel

> `readonly` **releaseChannel**: [`OsReleaseChannel`](#osreleasechannel)

##### releaseLabel?

> `readonly` `optional` **releaseLabel?**: `string`

##### version

> `readonly` **version**: `string`

***

### OsVersionInput

Input accepted by OS resolution and formatting helpers.

#### Properties

##### build

> `readonly` **build**: `string`

##### productIdentifier

> `readonly` **productIdentifier**: `string`

***

### UnknownOsVersion

A build that is not present in the package catalog.

#### Properties

##### build

> `readonly` **build**: `string`

##### known

> `readonly` **known**: `false`

##### platform

> `readonly` **platform**: [`OsPlatform`](#osplatform)

## Type Aliases

### DeviceFamily

> **DeviceFamily** = `"iPhone"` \| `"iPad"`

A supported hardware family. New families may be added in minor releases.

***

### OsPlatform

> **OsPlatform** = `"iOS"` \| `"iPadOS"` \| `"unknown"`

A platform name derived from the device family and known OS version.

***

### OsReleaseChannel

> **OsReleaseChannel** = `"stable"` \| `"beta"` \| `"release-candidate"` \| `"rapid-security-response"`

The release stage encoded by a known build.

***

### OsVersionResolution

> **OsVersionResolution** = [`KnownOsVersion`](#knownosversion) \| [`UnknownOsVersion`](#unknownosversion)

The lossless result of resolving an OS build.

## Functions

### formatOsVersion()

> **formatOsVersion**(`input`): [`FormattedOsVersion`](#formattedosversion)

Format a build for display and copying while preserving the original build value.

#### Parameters

##### input

[`OsVersionInput`](#osversioninput)

#### Returns

[`FormattedOsVersion`](#formattedosversion)

***

### getDevice()

> **getDevice**(`productIdentifier`): [`DeviceInfo`](#deviceinfo) \| `undefined`

Resolve an exact Apple product identifier to structured device information.

#### Parameters

##### productIdentifier

`string`

#### Returns

[`DeviceInfo`](#deviceinfo) \| `undefined`

***

### getDeviceModelName()

> **getDeviceModelName**(`productIdentifier`): `string` \| `undefined`

Resolve an exact Apple product identifier to its marketing model name.

#### Parameters

##### productIdentifier

`string`

#### Returns

`string` \| `undefined`

***

### getOsVersion()

> **getOsVersion**(`input`): [`OsVersionResolution`](#osversionresolution)

Resolve an exact OS build number while preserving unknown future builds.

#### Parameters

##### input

[`OsVersionInput`](#osversioninput)

#### Returns

[`OsVersionResolution`](#osversionresolution)
