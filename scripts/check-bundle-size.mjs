import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';

export function parseBudget(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error('Anggaran harus angka kilobyte');
  }
  return n * 1024;
}

export function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function readLocaleChunks(buildDir, manifest) {
  const pageChunks = manifest.pages?.['/[locale]'] ?? manifest.pages?.['/[locale]/page'];
  if (pageChunks?.length) return pageChunks;

  const clientManifestPath = path.join(
    buildDir,
    'server',
    'app',
    '[locale]',
    'page_client-reference-manifest.js'
  );
  if (!existsSync(clientManifestPath)) {
    throw new Error('Chunk halaman /[locale] tidak ditemukan di output build');
  }

  const source = readFileSync(clientManifestPath, 'utf8');
  return [...source.matchAll(/(?:\/_next\/)?(static\/chunks\/[^"\\]+\.js)/g)].map(
    (match) => match[1]
  );
}

function checkBundleSize() {
  const buildDir = path.resolve('.next');
  const manifestPath = path.join(buildDir, 'build-manifest.json');
  if (!existsSync(manifestPath)) {
    throw new Error('Build manifest tidak ditemukan; jalankan npm run build lebih dulu');
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const files = [
    ...new Set([...(manifest.rootMainFiles ?? []), ...readLocaleChunks(buildDir, manifest)])
  ];
  const budget = parseBudget(process.argv[2] ?? '150');

  console.log('Initial JavaScript bundle (gzip):');
  let total = 0;
  for (const file of files) {
    const filePath = path.join(buildDir, file);
    if (!existsSync(filePath)) throw new Error(`Berkas bundle tidak ditemukan: ${file}`);

    const size = gzipSync(readFileSync(filePath)).length;
    total += size;
    console.log(`  ${file}: ${formatKb(size)}`);
  }

  console.log(`Total: ${formatKb(total)} / ${formatKb(budget)}`);
  if (total > budget) {
    console.error(`Bundle melebihi anggaran sebesar ${formatKb(total - budget)}`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    checkBundleSize();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
