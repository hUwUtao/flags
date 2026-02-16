# Flags

Flags of many country on Earth

- Comprehensible packing
- Easy to use 
- To work with modern or old browser

caveats:

- May not natively work with `<select>`
- Quite large if not lossless compressed (160kb raw | 31kb brotli)

preview:

<img src="https://cdn.jsdelivr.net/gh/hUwUtao/flags@master/generated/flags-atlas.svg#flag-vn" alt="Vietnam flag" />
<img src="https://cdn.jsdelivr.net/gh/hUwUtao/flags@master/generated/flags-atlas.svg#flag-us" alt="Vietnam flag" />
<img src="https://cdn.jsdelivr.net/gh/hUwUtao/flags@master/generated/flags-atlas.svg#flag-jp" alt="Vietnam flag" />

## Quick Start (CDN)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/hUwUtao/flags@master/generated/flags.css" />
<!-- or: -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/hUwUtao/flags@master/generated/flags-inline.css" />
```

Use it:

```html
<span class="flg vn"></span>
<span class="flg us"></span>
<span class="flg jp"></span>
```

## Size / Crop

```css
:root { --s: 1; }  /* scale (24px base) */
:root { --ci: 1; } /* circle inset (px) */
```

Examples:

```css
.f16 { --s: .6667; } /* 16px */
.f8 { --s: .3333; }  /* 8px */
```

## SVG Fragment (<img>)

```html
<img src="https://cdn.jsdelivr.net/gh/hUwUtao/flags@master/generated/flags-atlas.svg#flag-vn" alt="Vietnam flag" />
```

## JSX / TSX (Local Assets)

Copy into your app:

- `generated/flags-inline.css` (single file), or
- `generated/flags.css` + `generated/flags-atlas.svg`

Import once in your entry:

```tsx
import "./assets/flags/flags.css";
// or: import "./assets/flags/flags-inline.css";
```

Use anywhere:

```tsx
export function DemoFlags() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span className="flg vn"></span>
      <span className="flg us"></span>
      <span className="flg jp" style={{ ["--s" as any]: 0.6667 }}></span>
    </div>
  );
}
```
