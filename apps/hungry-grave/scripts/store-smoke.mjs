// Store smoke test: one row through Neon and one gzipped blob through Vercel Blob.
import { randomBytes } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { neon } from '@neondatabase/serverless';
import { del, get, put } from '@vercel/blob';

async function rowRoundTrip() {
  const sql = neon(requireEnv('DATABASE_URL'));
  // One table per run, so an interrupted or concurrent run never collides.
  const table = `dry_run_smoke_${Date.now()}_${randomBytes(4).toString('hex')}`;
  try {
    await sql.query(`CREATE TABLE ${table} (note text)`);
    await sql.query(`INSERT INTO ${table} (note) VALUES ($1)`, [
      'hello from the cloud',
    ]);
    const rows = await sql.query(`SELECT note FROM ${table}`);
    const ok = rows.length === 1 && rows[0].note === 'hello from the cloud';
    return ok
      ? 'row round trip OK'
      : `row round trip mismatch: ${JSON.stringify(rows)}`;
  } finally {
    await sql.query(`DROP TABLE IF EXISTS ${table}`);
  }
}

async function blobRoundTrip() {
  requireEnv('BLOB_READ_WRITE_TOKEN');
  const bytes = gzipSync(randomBytes(200 * 1024));
  const pathname = `dry-run/${Date.now()}.gz`;
  const { url } = await put(pathname, bytes, {
    access: 'private',
    addRandomSuffix: true,
  });
  try {
    const result = await get(url, { access: 'private', useCache: false });
    if (result === null) return `blob not found after upload: ${url}`;
    const back = Buffer.from(await new Response(result.stream).arrayBuffer());
    const equal = back.equals(bytes);
    return equal
      ? `blob bytes equal (${bytes.length} bytes)`
      : `blob bytes differ: sent ${bytes.length}, got ${back.length}`;
  } finally {
    await del(url);
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

async function main() {
  for (const step of [rowRoundTrip, blobRoundTrip]) {
    try {
      console.log(await step());
    } catch (error) {
      console.log(
        `${step.name} error: ${error instanceof Error ? error.message : String(error)}`,
      );
      process.exitCode = 1;
    }
  }
}

main();
