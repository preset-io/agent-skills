# Listing assets

OpenAI's plugin directory needs a listing icon for this package. Icons are the
one piece of submission metadata that cannot live in the manifest alone, so they
are kept here and referenced from `.codex-plugin/plugin.json`.

## Icon requirements

Taken from [Package your plugin](https://developers.openai.com/plugins/build/plugins)
and the [submission error reference](https://developers.openai.com/plugins/deploy/submission-errors):

- Format: PNG, JPEG, WebP, or SVG.
- Square, at least 48 by 48 pixels.
- Raster images at most 4096 pixels per side; at most 5 MiB per file.
- SVG needs square numeric dimensions, or a square `viewBox` of at least 48 by 48.
- Paths in the manifest are `./`-prefixed and relative to the plugin root.

Dark-theme variants (`composerIconDark`, `logoDark`) are optional. Screenshots
are not accepted for a skills-only submission and must stay out of the manifest.

## Wiring an icon in

Drop the file in this directory, then add both fields to the `interface` object
in `.codex-plugin/plugin.json`:

```json
"logo": "./assets/logo.png",
"composerIcon": "./assets/logo.png"
```

`node scripts/build-openai-plugin-zip.mjs --check` warns while these fields are
unset and fails if they point at a file that is missing or oversized.

Alternatively the primary icon can be uploaded directly in the submission
dashboard, which satisfies the "App icon required" warning without adding a file
here.
