/**
 * Stop hook: rebuild every output once, at the end of a turn, if
 * scripts/roadmap/v1.yaml changed during it.
 *
 * The trigger is the end of the turn rather than each edit, because an agent
 * routinely rewrites a file in several passes. On PostToolUse a three-pass edit
 * announced itself three times and asked for three publishes of the same
 * picture. A turn is the smallest boundary at which the file is actually
 * settled.
 *
 * It stops where `wayfinder-map --hook` stops, for the same reason: nothing
 * outside a Claude Code session can publish an artifact, because there is no
 * CLI and no write API, only the Artifact tool. So this rebuilds the HTML and
 * hands the session the one instruction it needs.
 *
 * A broken hook must never block unrelated work, so every failure exits 0.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { publishInstruction } from '../../local/publish-instruction.mjs';
import { SOURCE, sourceHash, readStamp, recordHash } from './v1-stamp.mjs';

const ROOT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

async function readStdin() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  return raw;
}

/**
 * The trigger is the file's content changing since the last build, not a tool
 * call naming it. The hash also swallows a rewrite that produces identical
 * bytes, and it is what makes the second stop of a turn quiet: publishing does
 * not touch the source. A session that ran the build itself already stamped
 * that hash, so this stays silent for it too.
 *
 * Returns the new hash when the source changed, and null when it did not.
 */
function changedHash() {
  const now = sourceHash(ROOT);
  if (now === null) return null;
  return now === readStamp(ROOT) ? null : now;
}

function outputs() {
  const require = createRequire(import.meta.url);
  const yaml = require(`${ROOT}/node_modules/.pnpm/js-yaml@4.3.1/node_modules/js-yaml`);
  const d = yaml.load(readFileSync(`${ROOT}/${SOURCE}`, 'utf8'));
  return Object.entries(d.outputs);
}

function rebuild(key) {
  const run = spawnSync('node', ['scripts/roadmap/build-v1.mjs', key], { cwd: ROOT, encoding: 'utf8' });
  return { ok: run.status === 0, text: (run.stdout + run.stderr).trim() };
}

/**
 * Exit 2 with the message on stderr, which is the one blocking form the docs
 * state the same way for every hook: the stop is refused and stderr is handed
 * back to the agent. The JSON forms for Stop are reported inconsistently, so
 * this takes the path that does not depend on which one is right.
 */
function tellAgent(reason) {
  process.stderr.write(reason);
  process.exit(2);
}

function report() {
  let entries;
  try {
    entries = outputs();
  } catch (err) {
    // A source that will not parse is the loudest thing that can happen here:
    // every output is now stale and nothing downstream would say so.
    return `${SOURCE} changed and CANNOT BE READ, so no output was rebuilt and every ` +
      `published page is now stale. Tell the user, and do not publish. ${err.message}`;
  }

  const lines = entries.map(([key, out]) => {
    const { ok, text } = rebuild(key);
    return ok
      ? `${key}: rebuilt ${out.out}. ${publishInstruction(out)}`
      : `${key}: THE BUILD FAILED and the page is now stale. Do not publish. ${text}`;
  });

  return `${SOURCE} changed during this turn, so its outputs were rebuilt once. ` +
    `Publish them, then finish.\n${lines.join('\n')}`;
}

async function main() {
  const payload = JSON.parse(await readStdin());
  // Belt and braces against re-entry. The real guard is the stamp below: the
  // hash is recorded before the block, so the next stop sees no change at all.
  if (payload.stop_hook_active === true) return;

  const hash = changedHash();
  if (hash === null) return;

  recordHash(ROOT, hash);
  tellAgent(report());
}

try {
  await main();
  process.exit(0);
} catch {
  process.exit(0);
}
