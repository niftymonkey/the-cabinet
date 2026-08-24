# Getting a recorded run off a phone, and what the phone will tell us

Researched 2026-08-23 for dispatch 6a (#48). Written down here because none of it lives in an ADR: these are capabilities of the platform rather than decisions about the game, and re-establishing them from primary sources is expensive.

## `localStorage` is not a sink

The quota is 5 MiB charged in UTF-16, so a 1 MB JSON payload costs about 2 MiB. One run fits. A third write **fails silently**: `src/engine/utils/storage.ts:245-251` catches `QuotaExceededError`, and `warnOnce` limits the console to one message per page load, on a phone where nobody is reading the console.

Safari also deletes all script-writable storage after seven days without site interaction.

At best `localStorage` is a crash-survival buffer during a run. It is not where tapes live.

## The sink that works

An `<a download>` on a `blob:` URL, fired from inside a real tap handler. Supported on iOS Safari 13 and later.

`navigator.share({files})` would be one tap to AirDrop, but file support could not be confirmed from a primary source. Feature-detect with `navigator.canShare({files})` and fall back to the download link.

The app has zero network code today.

## Two signals verified unavailable

- **Memory and GC: nothing.** `performance.memory` is non-standard, deprecated and Chromium-only. The standardised replacement requires cross-origin isolation, which this site does not have. There is no memory or GC signal on the phone at all.
- **Batch breaks: nothing.** Pixi 8.19.0 exposes no batch-break counter. The one reachable proxy is `app.stage.renderGroup.instructionSet.instructionSize`, which counts instructions rather than breaks.

## Portable on iOS Safari

`navigator.userAgent` (record raw, never parse: iPadOS reports as Macintosh), `devicePixelRatio`, `screen.width` and `screen.height`, `innerWidth` and `innerHeight`, `hardwareConcurrency` (iOS 15.4 and later, after a gap), `maxTouchPoints`, `language`, and the `Intl` timezone.

**Not available:** `navigator.deviceMemory`.

## Volume

18,000 frames at five minutes.

- Row objects with short keys and 8 numeric fields: about 58 bytes a frame, roughly 1.0 MB.
- Columnar integer arrays: about 26 bytes a frame, roughly 470 KB.
