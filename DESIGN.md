---
name: LicoLand Website
description: The organization homepage. The page is ciphertext and reads only where the visitor is.
colors:
  ground: "#0a0820"
  raise: "#17133a"
  milk: "#fff8ea"
  soft: "#b8b0e0"
  lavender: "#bba5fb"
  blue: "#5b82ff"
  gold: "#f2c14e"
typography:
  wordmark:
    fontFamily: "Bricolage Grotesque, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "min(24.2vw, 37svh)"
    fontWeight: 700
    lineHeight: 0.84
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Bricolage Grotesque, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "clamp(44px, 6.8vw, 108px)"
    fontWeight: 680
    lineHeight: 0.94
    letterSpacing: "-0.038em"
  body:
    fontFamily: "Bricolage Grotesque, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "18px"
    fontWeight: 440
    lineHeight: 1.5
rounded:
  control: "999px"
  row: "24px"
---

# Design System: LicoLand Website

Updated: 2026-11-16

## Overview

lico.land defines the LicoLand brand. Its one idea is the organization's own
subject: content is readable only at the endpoint. The page is real, readable
HTML. Over it, `cipher.js` draws every character as a cipher shape in the
place its letter occupies. A lens follows the visitor and shows the text under
it; the Cipher and Plain switch opens or seals the whole page.

## The cipher alphabet

`tiles.js` owns the alphabet: quarter discs, a dome, a bowl, a disc and a
block, set on a small grid inside each letter's box. Tall letters use two
rows, short letters one. Large type takes the brand colours; small type is one
quiet tone. Shapes change slowly, and what the visitor has read is sealed
again behind the lens. The product sites use the same alphabet wherever they
show a sealed record.

## Colors

One night ground carries the page. Milk sets type. Lavender, blue and gold
appear only in cipher shapes and in the names of the trust boundary.

## Layout

The first screen holds the wordmark, one sentence and the three projects. The
second section sends one message from edge to edge: it is readable at the two
ends, sealed between them, and passes behind a tower in the middle. Each
project's name stands where that project acts. Repositories and trust
boundaries follow as plain lists.

## Access

- Without JavaScript, or with reduced motion, the page is plain text from the
  first paint. The veil and the switch exist only when the script runs.
- The organization mark and the message demonstration are never veiled.
- Keyboard focus moves the lens to the focused control.
- Search engines and assistive technology read the HTML; the veil is a canvas
  marked as decorative.

## Do's and Don'ts

- **Do** keep every sentence aligned with the owning project's public documents.
- **Do** keep the page readable and navigable without JavaScript.
- **Don't** put information only in the canvas.
- **Don't** depend on external fonts, scripts or analytics.
