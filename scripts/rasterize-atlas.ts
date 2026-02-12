import { stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const OUT_DIR = "generated";
const SVG_FILE = join(OUT_DIR, "flags-atlas.svg");
const PNG_FILE = join(OUT_DIR, "flags-atlas.png");
const WEBP_FILE = join(OUT_DIR, "flags-atlas.webp");
const RASTER_SCALE = 2;

const main = async (): Promise<void> => {
  await stat(SVG_FILE);

  const svg = sharp(SVG_FILE);
  const meta = await svg.metadata();

  if (!meta.width || !meta.height) {
    throw new Error(`Unable to read SVG dimensions from ${SVG_FILE}`);
  }

  const width = meta.width * RASTER_SCALE;
  const height = meta.height * RASTER_SCALE;

  await svg
    .resize(width, height, { kernel: "lanczos3" })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: false,
      palette: true,
      quality: 30,
      colours: 64,
      effort: 10,
      dither: 0.7,
    })
    .toFile(PNG_FILE);
  await sharp(SVG_FILE)
    .resize(width, height, { kernel: "lanczos3" })
    .webp({
      preset: "icon",
      quality: 64,
      alphaQuality: 1,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(WEBP_FILE);

  console.log(
    `Rasterized atlas ${meta.width}x${meta.height} (x${RASTER_SCALE}) -> ${PNG_FILE}, ${WEBP_FILE}.`,
  );
};

await main();
