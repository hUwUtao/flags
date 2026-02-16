import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = "generated";
const CSS_FILE = join(OUT_DIR, "flags.css");
const SVG_FILE = join(OUT_DIR, "flags-atlas.svg");
const INLINE_CSS_FILE = join(OUT_DIR, "flags-inline.css");

const toDataUri = (svg: string): string => {
  const cleaned = svg.trim();
  const encoded = encodeURIComponent(cleaned)
    .replace(/%20/g, " ")
    .replace(/%3D/g, "=")
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/")
    .replace(/%22/g, '"');

  return `url('data:image/svg+xml,${encoded}')`;
};

const main = async (): Promise<void> => {
  const [css, svg] = await Promise.all([
    readFile(CSS_FILE, "utf8"),
    readFile(SVG_FILE, "utf8"),
  ]);

  const inlineUrl = toDataUri(svg);
  const inlineCss = css
    .replace("url('./flags-atlas.svg')", inlineUrl)
    .replace('url("./flags-atlas.svg")', inlineUrl);

  await writeFile(INLINE_CSS_FILE, inlineCss, "utf8");
  console.log(`Generated ${INLINE_CSS_FILE} with embedded SVG data URI.`);
};

await main();
