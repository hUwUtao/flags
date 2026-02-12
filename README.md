# flags

Compact flag atlas + CSS sprites, ready for CDN usage.

## Build

```bash
bun run build:atlas
```

Outputs in `generated/`:

- `flags-atlas.svg`
- `flags-atlas.png`
- `flags-atlas.webp`
- `flags-index.json`
- `flags.css`
- `flags-inline.css` (embedded SVG data URI, non-base64)
- `test.html`

## jsDelivr Guide

Generated files are committed so jsDelivr can serve them directly from the repo.

Live now:

- `https://cdn.jsdelivr.net/gh/hUwUtao/flags@master/generated/flags.css`
- `https://cdn.jsdelivr.net/gh/hUwUtao/flags@master/generated/flags-inline.css`

### 1) Use latest (fast setup)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/hUwUtao/flags@master/generated/flags.css" />
```

### 2) Use pinned version (recommended)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/hUwUtao/flags@master/generated/flags.css" />
```

### 3) Use inline CSS variant (single file)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/hUwUtao/flags@master/generated/flags-inline.css" />
```

## Usage

```html
<span class="flg us"></span>
<span class="flg jp"></span>
<span class="flg br"></span>
```

Optional sizing:

```css
:root { --s: 1; }   /* base 24px */
.sm { --s: .6667; } /* 16px */
.xs { --s: .3333; } /* 8px */
```
