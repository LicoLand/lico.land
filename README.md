# lico.land

Updated: 2026-11-17

Static organization introduction for LicoLand.

This repository contains only the public website. Product specifications,
operational configuration, credentials, and runtime data belong to their
owning repositories or private deployment environments.

This static source is a projection. Its presence, CNAME, or DNS material does
not prove publication, product release, support, or hosted-service operation.

## Website

The site is static HTML, CSS, and dependency-free JavaScript with a self-hosted
font; there is no build step. GitHub Pages publishes `docs/` from the main
branch; serve it locally with any static HTTP server
(`python3 -m http.server --directory docs`). The page is plain, readable HTML: navigation, links, and copy
work without JavaScript. When the script runs, the page is drawn as ciphertext
and reads only under the visitor's lens or in Plain mode; the reduced-motion
preference starts in Plain mode. [DESIGN.md](DESIGN.md) records the implemented
visual system, and [ASSETS.md](ASSETS.md) records asset origins
and the font license.

The reviewed Cloudflare BIND import is stored at
`dns/cloudflare-github-pages.txt`. Organization-verification tokens are added
directly in the DNS provider and are never committed.

This site is continuously delivered and does not own a product version.
