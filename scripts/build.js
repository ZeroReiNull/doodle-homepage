const { mkdir, readFile, writeFile } = require("node:fs/promises");
const { dirname, relative, resolve, sep } = require("node:path");
const { Script } = require("node:vm");

const projectRoot = resolve(__dirname, "..");
const entryPath = resolve(projectRoot, "index.html");
const outputPath = resolve(projectRoot, "dist", "index.html");

function readAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match?.[2] || "";
}

function isLocalAsset(reference) {
  return reference && !/^(?:[a-z]+:|\/\/|#)/i.test(reference);
}

function resolveAsset(reference) {
  const cleanReference = reference.split(/[?#]/, 1)[0];
  const assetPath = resolve(projectRoot, cleanReference);
  if (assetPath !== projectRoot && !assetPath.startsWith(projectRoot + sep)) {
    throw new Error(`Asset path escapes the project root: ${reference}`);
  }
  return assetPath;
}

async function replaceAsync(source, pattern, replacement) {
  const matches = [...source.matchAll(pattern)];
  const replacements = await Promise.all(matches.map(match => replacement(match)));
  let cursor = 0;
  let result = "";

  matches.forEach((match, index) => {
    result += source.slice(cursor, match.index) + replacements[index];
    cursor = match.index + match[0].length;
  });

  return result + source.slice(cursor);
}

async function inlineStyles(html, bundledFiles) {
  return replaceAsync(html, /<link\b[^>]*>/gi, async match => {
    const tag = match[0];
    if (readAttribute(tag, "rel").toLowerCase() !== "stylesheet") return tag;

    const href = readAttribute(tag, "href");
    if (!isLocalAsset(href)) return tag;

    const assetPath = resolveAsset(href);
    bundledFiles.push(href);
    const stylesheet = await readFile(assetPath, "utf8");
    if (/<\/style/i.test(stylesheet)) {
      throw new Error(`${href} contains a closing style tag and cannot be safely inlined.`);
    }
    return `<style data-source="${href}">\n${stylesheet.trimEnd()}\n  </style>`;
  });
}

async function inlineScripts(html, bundledFiles) {
  return replaceAsync(html, /<script\b[^>]*\bsrc\s*=\s*(["']).*?\1[^>]*>\s*<\/script>/gi, async match => {
    const tag = match[0];
    const src = readAttribute(tag, "src");
    if (!isLocalAsset(src)) return tag;

    const assetPath = resolveAsset(src);
    bundledFiles.push(src);
    const script = await readFile(assetPath, "utf8");
    if (/<\/script/i.test(script)) {
      throw new Error(`${src} contains a closing script tag and cannot be safely inlined.`);
    }
    new Script(script, { filename: src });

    const openingTag = tag.match(/^<script\b[^>]*>/i)?.[0] || "<script>";
    const inlineTag = openingTag
      .replace(/\s+src\s*=\s*(["']).*?\1/i, "")
      .replace(/>$/, ` data-source="${src}">`);
    return `${inlineTag}\n${script.trimEnd()}\n  </script>`;
  });
}

async function build() {
  const bundledFiles = [];
  const source = await readFile(entryPath, "utf8");
  const withStyles = await inlineStyles(source, bundledFiles);
  const output = await inlineScripts(withStyles, bundledFiles);

  const remainingLocalAssets = [...output.matchAll(/<(?:link|script)\b[^>]*(?:href|src)\s*=\s*(["'])(.*?)\1[^>]*>/gi)]
    .map(match => match[2])
    .filter(isLocalAsset);
  if (remainingLocalAssets.length) {
    throw new Error(`Local assets were not bundled: ${remainingLocalAssets.join(", ")}`);
  }
  if (!bundledFiles.length) throw new Error("No local CSS or JavaScript files were found to bundle.");

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output, "utf8");

  const outputName = relative(projectRoot, outputPath);
  const size = Buffer.byteLength(output);
  console.log(`Built ${outputName} (${size.toLocaleString()} bytes)`);
  console.log(`Inlined ${bundledFiles.length} files: ${bundledFiles.join(", ")}`);
}

build().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
