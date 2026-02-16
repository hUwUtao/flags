import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, basename } from "node:path";

type FlagEntry = {
  code: string;
  index: number;
  row: number;
  col: number;
  x: number;
  y: number;
  symbolId: string;
  viewBox: string;
  inner: string;
};

const TILE_SIZE = 24;
const SOURCE_DIR = "assets";
const OUT_DIR = "generated";
const ATLAS_FILE = "flags-atlas.svg";
const INDEX_JSON_FILE = "flags-index.json";
const CSS_FILE = "flags.css";
const TEST_HTML_FILE = "test.html";

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");

const rewriteIds = (svgInner: string, prefix: string): string => {
  const ids = new Set<string>();
  const idRegex = /\sid="([^"]+)"/g;
  for (const match of svgInner.matchAll(idRegex)) {
    ids.add(match[1]);
  }

  let output = svgInner;
  for (const id of ids) {
    const next = `${prefix}__${id}`;

    output = output.replace(
      new RegExp(`(\\sid=")${escapeRegex(id)}(")`, "g"),
      `$1${next}$2`,
    );
    output = output.replace(
      new RegExp(`url\\(#${escapeRegex(id)}\\)`, "g"),
      `url(#${next})`,
    );
    output = output.replace(
      new RegExp(`(href=")#${escapeRegex(id)}(")`, "g"),
      `$1#${next}$2`,
    );
    output = output.replace(
      new RegExp(`(xlink:href=")#${escapeRegex(id)}(")`, "g"),
      `$1#${next}$2`,
    );
  }

  return output;
};

const extractSvgParts = (source: string): { viewBox: string; inner: string } => {
  const openTagMatch = source.match(/<svg[^>]*>/i);
  if (!openTagMatch) {
    throw new Error("Invalid SVG: missing <svg> root");
  }

  const viewBoxMatch = openTagMatch[0].match(/viewBox="([^"]+)"/i);
  const viewBox = viewBoxMatch?.[1] ?? `0 0 ${TILE_SIZE} ${TILE_SIZE}`;

  const inner = source
    .replace(/^[\s\S]*?<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "")
    .trim();

  return { viewBox, inner };
};

const main = async (): Promise<void> => {
  const files = (await readdir(SOURCE_DIR))
    .filter((file) => file.toLowerCase().endsWith(".svg"))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    throw new Error(`No SVG files found in ${SOURCE_DIR}`);
  }

  const cols = Math.ceil(Math.sqrt(files.length));
  const rows = Math.ceil(files.length / cols);
  const width = cols * TILE_SIZE;
  const height = rows * TILE_SIZE;

  const entries: FlagEntry[] = [];

  for (const [index, file] of files.entries()) {
    const code = basename(file, ".svg").toUpperCase();
    const source = await readFile(join(SOURCE_DIR, file), "utf8");
    const { viewBox, inner } = extractSvgParts(source);

    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = col * TILE_SIZE;
    const y = row * TILE_SIZE;
    const symbolId = `flg${code.toLowerCase()}`;

    entries.push({
      code,
      index,
      row,
      col,
      x,
      y,
      symbolId,
      viewBox,
      inner: rewriteIds(inner, symbolId),
    });
  }

  const symbols = entries
    .map(
      (entry) =>
        `<symbol id="${entry.symbolId}" viewBox="${entry.viewBox}">${entry.inner}</symbol>`,
    )
    .join("\n");

  const views = entries
    .map(
      (entry) =>
        `<view id="flag-${entry.code.toLowerCase()}" viewBox="${entry.x} ${entry.y} ${TILE_SIZE} ${TILE_SIZE}"/>`,
    )
    .join("\n");

  const uses = entries
    .map(
      (entry) =>
        `<use href="#${entry.symbolId}" x="${entry.x}" y="${entry.y}" width="${TILE_SIZE}" height="${TILE_SIZE}"/>`,
    )
    .join("\n");

  const atlasSvg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<defs>`,
    symbols,
    views,
    `</defs>`,
    uses,
    `</svg>`,
  ].join("\n");

  const indexPayload = {
    tileSize: TILE_SIZE,
    cols,
    rows,
    width,
    height,
    count: entries.length,
    entries: entries.map(({ inner, viewBox, ...rest }) => rest),
  };

  const codeClassRules = entries
    .map(
      (entry) => `.flg.${entry.code.toLowerCase()}{--x:${entry.col};--y:${entry.row};}`,
    )
    .join("\n");

  const css = [
    `:root{--ts:${TILE_SIZE};--s:1;--ci:1;--cw:${cols};--ch:${rows};--u:url('./${ATLAS_FILE}');}`,
    `.flg{--x:0;--y:0;display:inline-block;width:calc(var(--ts)*var(--s)*1px);height:calc(var(--ts)*var(--s)*1px);background:var(--u) no-repeat;background-size:calc(var(--cw)*var(--ts)*var(--s)*1px) calc(var(--ch)*var(--ts)*var(--s)*1px);background-position:calc(var(--x)*var(--ts)*var(--s)*-1px) calc(var(--y)*var(--ts)*var(--s)*-1px);border-radius:50%;clip-path:circle(calc(50% - var(--ci)*var(--s)*1px));}`,
    codeClassRules,
  ].join("\n");

  const previewItems = entries
    .map(
      (entry) =>
        `<figure class="item"><span class="flg ${entry.code.toLowerCase()}" title="${entry.code}"></span><figcaption>${entry.code}</figcaption></figure>`,
    )
    .join("\n");

  const testHtml = [
    `<!doctype html>`,
    `<html lang="en">`,
    `<head>`,
    `  <meta charset="utf-8">`,
    `  <meta name="viewport" content="width=device-width,initial-scale=1">`,
    `  <title>Flags Atlas Test</title>`,
    `  <link rel="stylesheet" href="./flags.css">`,
    `  <style>`,
    `    :root{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;}`,
    `    body{margin:20px;background:#fafafa;color:#1c1c1c;}`,
    `    h1{margin:0 0 6px;font-size:20px;}`,
    `    p{margin:0 0 14px;color:#555;font-size:13px;}`,
    `    .toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px;}`,
    `    .tab{appearance:none;border:1px solid #d1d5db;background:#fff;color:#111827;padding:7px 10px;border-radius:8px;font-size:12px;font-weight:700;letter-spacing:.02em;cursor:pointer;}`,
    `    .tab.active{background:#111827;color:#fff;border-color:#111827;}`,
    `    .gauge{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px;align-items:center;}`,
    `    .gauge-label{font-size:12px;font-weight:700;color:#4b5563;margin-right:2px;}`,
    `    .gauge-btn{appearance:none;border:1px solid #d1d5db;background:#fff;color:#111827;padding:7px 10px;border-radius:8px;font-size:12px;font-weight:700;letter-spacing:.02em;cursor:pointer;}`,
    `    .gauge-btn.active{background:#0f766e;color:#fff;border-color:#0f766e;}`,
    `    .flash{appearance:none;border:1px solid #d1d5db;background:#fff;color:#111827;padding:7px 10px;border-radius:8px;font-size:12px;font-weight:700;letter-spacing:.02em;cursor:pointer;}`,
    `    .flash.on{background:#b91c1c;color:#fff;border-color:#b91c1c;}`,
    `    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:10px;}`,
    `    .item{margin:0;padding:8px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;text-align:center;}`,
    `    .preview{--u:url('./flags-atlas.svg');}`,
    `    .preview .item .flg{display:block;margin:0 auto 6px;}`,
    `    figcaption{font-size:12px;font-weight:600;letter-spacing:.02em;}`,
  `  </style>`,
    `</head>`,
    `<body>`,
    `  <h1>Flags Atlas Preview</h1>`,
    `  <p>${entries.length} flags, ${cols}x${rows} tiles, ${TILE_SIZE}px each.</p>`,
    `  <div class="toolbar">`,
    `    <button type="button" class="tab active" data-src="./flags-atlas.svg">SVG</button>`,
    `    <button type="button" class="tab" data-src="./flags-atlas.png">PNG</button>`,
    `    <button type="button" class="tab" data-src="./flags-atlas.webp">WEBP</button>`,
    `    <button type="button" class="flash" id="flash-toggle">Flash Compare</button>`,
    `  </div>`,
    `  <div class="gauge">`,
    `    <span class="gauge-label">Gauge</span>`,
    `    <button type="button" class="gauge-btn" data-size="8">8px</button>`,
    `    <button type="button" class="gauge-btn" data-size="16">16px</button>`,
    `    <button type="button" class="gauge-btn active" data-size="24">24px</button>`,
    `  </div>`,
    `  <section class="preview" id="preview">`,
    `    <section class="grid">`,
    previewItems,
    `    </section>`,
  `  </section>`,
    `  <script>`,
    `    const preview = document.getElementById('preview');`,
    `    const tabs = Array.from(document.querySelectorAll('.tab'));`,
    `    const flashToggle = document.getElementById('flash-toggle');`,
    `    const gaugeButtons = Array.from(document.querySelectorAll('.gauge-btn'));`,
    `    const sources = tabs.map((tab) => tab.dataset.src);`,
    `    const baseTileSize = ${TILE_SIZE};`,
    `    let flashTimer = null;`,
    `    let activeIndex = 0;`,
    `    const setActive = (index) => {`,
    `      activeIndex = index;`,
    `      const src = sources[index];`,
    `      preview.style.setProperty('--u', \"url('\" + src + \"')\");`,
    `      tabs.forEach((tab, i) => tab.classList.toggle('active', i === index));`,
    `    };`,
    `    const setGauge = (size) => {`,
    `      const scale = size / baseTileSize;`,
    `      preview.style.setProperty('--s', String(scale));`,
    `      gaugeButtons.forEach((btn) => btn.classList.toggle('active', Number(btn.dataset.size) === size));`,
    `    };`,
    `    tabs.forEach((tab, index) => {`,
    `      tab.addEventListener('click', () => {`,
    `        if (flashTimer) return;`,
    `        setActive(index);`,
    `      });`,
    `    });`,
    `    gaugeButtons.forEach((btn) => {`,
    `      btn.addEventListener('click', () => setGauge(Number(btn.dataset.size)));`,
    `    });`,
    `    setGauge(24);`,
    `    flashToggle.addEventListener('click', () => {`,
    `      if (flashTimer) {`,
    `        clearInterval(flashTimer);`,
    `        flashTimer = null;`,
    `        flashToggle.classList.remove('on');`,
    `        return;`,
    `      }`,
    `      flashToggle.classList.add('on');`,
    `      flashTimer = setInterval(() => {`,
    `        const next = (activeIndex + 1) % sources.length;`,
    `        setActive(next);`,
    `      }, 260);`,
    `    });`,
    `  </script>`,
    `</body>`,
    `</html>`,
  ].join("\n");

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, ATLAS_FILE), `${atlasSvg}\n`, "utf8");
  await writeFile(
    join(OUT_DIR, INDEX_JSON_FILE),
    `${JSON.stringify(indexPayload, null, 2)}\n`,
    "utf8",
  );
  await writeFile(join(OUT_DIR, CSS_FILE), `${css}\n`, "utf8");
  await writeFile(join(OUT_DIR, TEST_HTML_FILE), `${testHtml}\n`, "utf8");

  console.log(
    `Generated ${join(OUT_DIR, ATLAS_FILE)} (${width}x${height}) with ${entries.length} flags on a ${cols}x${rows} grid.`,
  );
};

await main();
