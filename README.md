# flags

Flag assets are compacted into a single square SVG atlas.

## Build atlas

```bash
bun run build:atlas
```

This generates:

- `generated/flags-atlas.svg` (single 14x14 atlas, 24px tiles)
- `generated/flags-atlas.png` (rasterized atlas)
- `generated/flags-atlas.webp` (rasterized atlas)
- `generated/flags-index.json` (code/index/x/y mapping)
- `generated/flags.css` (`.flg.xx` sprite selectors with integer `--x/--y` grid vars)
- `generated/flags-inline.css` (same CSS with SVG atlas embedded as UTF-8 data URI, non-base64)
- `generated/test.html` (preview grid)
