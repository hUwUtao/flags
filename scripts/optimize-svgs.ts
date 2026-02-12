import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { optimize } from "svgo";

const ASSETS_DIR = "assets";
const GENERATED_ATLAS = join("generated", "flags-atlas.svg");

const SVGO_CONFIG = {
  multipass: true,
  js2svg: {
    indent: 0,
    pretty: false,
  },
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          cleanupIds: false,
        },
      },
    },
  ],
} as const;

const optimizeFile = async (path: string): Promise<{ before: number; after: number }> => {
  const source = await readFile(path, "utf8");
  const optimized = optimize(source, {
    ...SVGO_CONFIG,
    path,
  });

  if ("error" in optimized) {
    throw new Error(`${path}: ${optimized.error}`);
  }

  await writeFile(path, `${optimized.data}\n`, "utf8");
  return { before: Buffer.byteLength(source), after: Buffer.byteLength(optimized.data) + 1 };
};

const main = async (): Promise<void> => {
  const assetSvgs = (await readdir(ASSETS_DIR))
    .filter((name) => name.toLowerCase().endsWith(".svg"))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => join(ASSETS_DIR, name));

  const files = [...assetSvgs, GENERATED_ATLAS];

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const { before, after } = await optimizeFile(file);
    totalBefore += before;
    totalAfter += after;
  }

  const saved = totalBefore - totalAfter;
  const pct = totalBefore > 0 ? ((saved / totalBefore) * 100).toFixed(2) : "0.00";

  console.log(
    `SVGO optimized ${files.length} files. ${totalBefore} -> ${totalAfter} bytes (saved ${saved} bytes, ${pct}%).`,
  );
};

await main();
