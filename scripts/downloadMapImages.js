#!/usr/bin/env node

/**
 * Downloads every map image referenced by
 * components/ui/MapImage/mapNameToImageUrl.ts and saves it to
 * assets/images/mapImages, named after its key (gaza2 -> gaza2.jpg).
 *
 * Usage: node scripts/downloadMapImages.js [--force]
 *   --force  re-download images that are already on disk
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const sourceFile = path.join(
  root,
  "components",
  "ui",
  "MapImage",
  "mapNameToImageUrl.ts",
);
const outputDir = path.join(root, "assets", "images", "mapImages");

const force = process.argv.includes("--force");

// The source is a TS module, so read the key/url pairs out of it directly
// rather than trying to import it. Values may wrap onto the next line.
const readEntries = () => {
  const source = fs.readFileSync(sourceFile, "utf8");
  const body = source.slice(source.indexOf("{"), source.lastIndexOf("}"));
  const pattern = /(\w+)\s*:\s*"([^"]+)"/g;

  const entries = [];
  let match;
  while ((match = pattern.exec(body)) !== null) {
    entries.push({ name: match[1], url: match[2] });
  }
  return entries;
};

const extensionFor = (url) => {
  const extension = path.extname(new URL(url).pathname);
  return extension || ".jpg";
};

const download = async (url, destination) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(destination, buffer);
  return buffer.length;
};

const run = async () => {
  const entries = readEntries();

  if (entries.length === 0) {
    console.error(`No map entries found in ${sourceFile}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`Found ${entries.length} maps. Saving to ${outputDir}\n`);

  let downloaded = 0;
  let skipped = 0;
  const failed = [];

  for (const { name, url } of entries) {
    const fileName = `${name}${extensionFor(url)}`;
    const destination = path.join(outputDir, fileName);

    if (!force && fs.existsSync(destination)) {
      console.log(`  skip      ${fileName}`);
      skipped += 1;
      continue;
    }

    try {
      const bytes = await download(url, destination);
      console.log(`  saved     ${fileName} (${Math.round(bytes / 1024)} kB)`);
      downloaded += 1;
    } catch (error) {
      console.log(`  FAILED    ${fileName} — ${error.message}`);
      failed.push({ name, url, reason: error.message });
    }
  }

  console.log(
    `\nDone. ${downloaded} downloaded, ${skipped} skipped, ${failed.length} failed.`,
  );

  if (failed.length > 0) {
    console.log("\nFailed downloads:");
    failed.forEach((item) => {
      console.log(`  ${item.name} — ${item.url}\n    ${item.reason}`);
    });
    process.exit(1);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
