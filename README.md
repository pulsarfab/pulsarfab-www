# PulsarFab website

Static marketing and regain documentation for **https://pulsarfab.com/**.
The dark layout, cards, documentation sidebar, and shared-block generation follow
`theatrus/psf-guard-docs`, with PulsarFab's amber/copper palette and its own content.

## Edit and generate

Requires Node.js 22 or newer; no npm dependencies or install step.

```sh
npm run build
npm run check
python -m http.server 8765
```

Edit page bodies in `index.html` and `docs/*.html`. Shared headers, documentation
navigation, previous/next links, footer, metadata, and release status are generated
by `scripts/build.mjs`. Change navigation and release status in `scripts/site.mjs`.
Do not hand-edit generated marker blocks. New docs pages must appear in navigation.

Keep the overview's use cases and `docs/hardware.html` aligned with the regain
repository README. Put detailed recovery, ASCOM, and headless setup guidance in
their respective guides. Preserve the distinction between SDK-free drivers and
OS USB-driver requirements, and between tested hardware and simulator coverage.

`npm run check` rejects stale generated HTML, broken local links/fragments, missing
images, duplicate IDs, and missing page landmarks or descriptions. GitHub Actions
runs it on pushes and pull requests. Generated HTML, sitemap, and robots.txt are
checked in, so the deployed site needs no Node process or build step.

## Releases and screenshots

The site documents regain 0.4.0.0. Release status is controlled by `scripts/site.mjs`.
For each new version, set `release.published` to `true` only after verifying the
signed GitHub release AND both NINA source endpoints.
Both `nina-plugins.pulsarfab.com` and `nina-plugins.psf-guard.com` are served by
`theatrus/nina-plugins-registry`; update that repository once, not this site, to
publish plugin packages.

Screenshots and regain artwork come from `pulsarfab/regain` at tag `v0.4.0.0`.
Preserve screenshot captions: FocusCube3 is physical; OFP2 is historical physical
hardware with the old brand; other screenshots use explicitly labeled simulation.
The PSF Guard site's analytics and conversion settings are not copied here.

## Publish

Push to `main` for the existing flotswarm deployment on ec2admin (nginx and TLS).
Run both commands above first and commit all generated output. No deployment
configuration change is needed. Preview desktop and narrow layouts before pushing.
