// Terminal shell for the morning-signals prototype (Wayfinder ticket #9).
// Throwaway by intent. The logic it drives lives in logic.ts and stays pure.

import { appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Experiment, NameSubmission, Scene, TraitValue } from './logic.ts';
import {
  POOLS,
  at,
  mulberry32,
  nameHolds,
  resolveNight,
  rollSpirits,
  traitName,
} from './logic.ts';

interface Args {
  seed?: number;
  spirits?: number;
  cap?: number;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = Number(argv[i + 1]);
    if (flag === '--seed') args.seed = value;
    if (flag === '--spirits') args.spirits = value;
    if (flag === '--cap') args.cap = value;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const seed = args.seed ?? Math.floor(Math.random() * 1_000_000_000);
const spiritCount = args.spirits ?? 1;
const cap = args.cap ?? null;

const rng = mulberry32(seed);
const spirits = rollSpirits(POOLS, spiritCount, rng);
const named = new Set<string>();

interface NightRecord {
  night: number;
  experiments: Experiment[];
  scenes: Scene[];
}

let night = 1;
let namingAttempts = 0;
const tonight = new Map<string, Experiment>();
const history: NightRecord[] = [];
let message = "Set tonight's experiments, then sleep.";

interface NamingDraft {
  trace?: string;
  hour?: string;
  lure?: string;
  aversion?: string;
  haunt?: string;
}

type Mode =
  | { kind: 'menu' }
  | {
      kind: 'experiment';
      room: TraitValue;
      step: 'candle' | 'lure' | 'ward';
      candle?: number;
      lure?: string;
    }
  | { kind: 'clear' }
  | {
      kind: 'naming';
      step: 'trace' | 'hour' | 'lure' | 'aversion' | 'haunt';
      draft: NamingDraft;
    }
  | { kind: 'done' };

let mode: Mode = { kind: 'menu' };

const logPath = fileURLToPath(new URL('./night-log.jsonl', import.meta.url));

function log(record: object): void {
  appendFileSync(
    logPath,
    `${JSON.stringify({ at: new Date().toISOString(), ...record })}\n`,
  );
}

log({ type: 'run-start', seed, spiritCount, spirits });

function seenTraces(): string[] {
  const seen: string[] = [];
  for (const record of history) {
    for (const scene of record.scenes) {
      if (scene.scene !== 'silent' && !seen.includes(scene.trace))
        seen.push(scene.trace);
    }
  }
  return seen;
}

function digit(key: string, max: number): number | null {
  const n = Number(key);
  return Number.isInteger(n) && n >= 1 && n <= max ? n : null;
}

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function poolLine(pool: TraitValue[]): string {
  return pool.map((v, i) => `${BOLD}${i + 1}${RESET} ${v.name}`).join('   ');
}

function markText(mark: number | null): string {
  return mark === null
    ? 'candle clean'
    : `mark at ${at(POOLS.hour, mark - 1).name}`;
}

function sceneText(scene: Scene): string {
  if (scene.scene === 'silent') return 'silent';
  const trace = traitName(POOLS.trace, scene.trace);
  if (scene.scene === 'turned-back') {
    return `turned back at the ward: ${trace}, ${markText(scene.mark)}, bowl untested`;
  }
  const bowl = scene.bowlTaken ? 'bowl taken' : 'bowl refused';
  const ward = scene.wardCrossed === null ? '' : ', ward crossed';
  return `came in: ${trace}, ${markText(scene.mark)}, ${bowl}${ward}`;
}

function experimentText(experiment: Experiment): string {
  const ward =
    experiment.ward === null
      ? 'no ward'
      : `ward ${traitName(POOLS.aversion, experiment.ward)}`;
  return `candle ${experiment.candle}, ${traitName(POOLS.lure, experiment.lure)}, ${ward}`;
}

function render(): void {
  const lines: string[] = [];
  const capText = cap === null ? '' : `  cap ${cap}/night`;
  lines.push(
    `${BOLD}HOUSEWARMING${RESET}  morning-signals prototype  ${DIM}seed ${seed}  spirits ${spiritCount}${capText}${RESET}  night ${night}  named ${named.size}/${spiritCount}`,
  );
  lines.push('');
  lines.push(`${BOLD}THE POOLS${RESET}`);
  lines.push(`  Watches   ${poolLine(POOLS.hour)}`);
  lines.push(`  Lures     ${poolLine(POOLS.lure)}`);
  lines.push(`  Wards     ${poolLine(POOLS.aversion)}`);
  lines.push(`  Rooms     ${poolLine(POOLS.haunt)}`);
  lines.push('');
  lines.push(`${BOLD}MORNINGS${RESET}`);
  if (history.length === 0) lines.push(`  ${DIM}none yet${RESET}`);
  for (const record of history) {
    for (const experiment of record.experiments) {
      const scene = record.scenes.find((s) => s.room === experiment.room);
      const room = traitName(POOLS.haunt, experiment.room).padEnd(15);
      const setup = experimentText(experiment).padEnd(42);
      lines.push(
        `  ${DIM}${record.night}${RESET}  ${room} ${DIM}${setup}${RESET} ${scene ? sceneText(scene) : ''}`,
      );
    }
  }
  lines.push('');
  lines.push(`${BOLD}TONIGHT${RESET}`);
  if (tonight.size === 0) lines.push(`  ${DIM}every room dark${RESET}`);
  for (const experiment of tonight.values()) {
    lines.push(
      `  ${traitName(POOLS.haunt, experiment.room).padEnd(15)} ${experimentText(experiment)}`,
    );
  }
  const dark = POOLS.haunt.filter((room) => !tonight.has(room.id));
  if (tonight.size > 0 && dark.length > 0) {
    lines.push(
      `  ${DIM}dark: ${dark.map((room) => room.name).join(', ')}${RESET}`,
    );
  }
  lines.push('');

  if (mode.kind === 'experiment') {
    lines.push(
      `${BOLD}SETTING ${traitName(POOLS.haunt, mode.room.id).toUpperCase()}${RESET}`,
    );
    if (mode.step === 'candle')
      lines.push(
        `  candle length in watches: ${BOLD}1${RESET}..${BOLD}4${RESET}   ${DIM}[esc] cancel${RESET}`,
      );
    if (mode.step === 'lure')
      lines.push(
        `  lure: ${poolLine(POOLS.lure)}   ${DIM}[esc] cancel${RESET}`,
      );
    if (mode.step === 'ward')
      lines.push(
        `  ward: ${BOLD}0${RESET} none   ${poolLine(POOLS.aversion)}   ${DIM}[esc] cancel${RESET}`,
      );
  } else if (mode.kind === 'clear') {
    lines.push(
      `  clear which room: ${poolLine(POOLS.haunt)}   ${DIM}[esc] cancel${RESET}`,
    );
  } else if (mode.kind === 'naming') {
    lines.push(`${BOLD}NAMING${RESET}`);
    const draft = mode.draft;
    const part = (label: string, pool: TraitValue[], id?: string) =>
      `${label} ${id ? traitName(pool, id) : '?'}`;
    lines.push(
      `  ${part('trace:', POOLS.trace, draft.trace)}   ${part('hour:', POOLS.hour, draft.hour)}   ${part('lure:', POOLS.lure, draft.lure)}   ${part('aversion:', POOLS.aversion, draft.aversion)}   ${part('haunt:', POOLS.haunt, draft.haunt)}`,
    );
    if (mode.step === 'trace') {
      const options = seenTraces().filter((t) => !named.has(t));
      lines.push(
        `  which spirit: ${options.map((t, i) => `${BOLD}${i + 1}${RESET} ${traitName(POOLS.trace, t)}`).join('   ')}   ${DIM}[esc] cancel${RESET}`,
      );
    }
    if (mode.step === 'hour')
      lines.push(
        `  its hour: ${poolLine(POOLS.hour)}   ${DIM}[esc] cancel${RESET}`,
      );
    if (mode.step === 'lure')
      lines.push(
        `  its lure: ${poolLine(POOLS.lure)}   ${DIM}[esc] cancel${RESET}`,
      );
    if (mode.step === 'aversion')
      lines.push(
        `  its aversion: ${poolLine(POOLS.aversion)}   ${DIM}[esc] cancel${RESET}`,
      );
    if (mode.step === 'haunt')
      lines.push(
        `  its haunt: ${poolLine(POOLS.haunt)}   ${DIM}[esc] cancel${RESET}`,
      );
  } else if (mode.kind === 'done') {
    lines.push(`${BOLD}THE HOUSE IS QUIET${RESET}`);
    lines.push(
      `  ${spiritCount} named in ${night - 1} nights, ${namingAttempts} naming attempts.`,
    );
    lines.push(`  ${DIM}log: ${logPath}${RESET}`);
  }

  lines.push('');
  lines.push(`> ${message}`);
  lines.push('');
  if (mode.kind === 'menu') {
    lines.push(
      `${BOLD}[1-4]${RESET}${DIM} set a room's experiment  ${RESET}${BOLD}[c]${RESET}${DIM} clear a room  ${RESET}${BOLD}[s]${RESET}${DIM} sleep  ${RESET}${BOLD}[n]${RESET}${DIM} name a spirit  ${RESET}${BOLD}[q]${RESET}${DIM} quit${RESET}`,
    );
  } else if (mode.kind === 'done') {
    lines.push(`${BOLD}[q]${RESET}${DIM} quit${RESET}`);
  }

  console.clear();
  console.log(lines.join('\n'));
}

function sleep(): void {
  if (tonight.size === 0) {
    message = 'No experiments set. A dark house teaches nothing.';
    return;
  }
  const experiments = [...tonight.values()];
  const loose = spirits.filter((s) => !named.has(s.trace));
  const scenes = resolveNight(POOLS, loose, experiments);
  history.push({ night, experiments, scenes });
  log({ type: 'night', night, experiments, scenes });
  night += 1;
  tonight.clear();
  message = `Morning ${night - 1} is in. Read it, then set the next night.`;
}

function submitName(draft: NamingDraft): void {
  const { trace, hour, lure, aversion, haunt } = draft;
  if (!trace || !hour || !lure || !aversion || !haunt) return;
  const submission: NameSubmission = { trace, hour, lure, aversion, haunt };
  const loose = spirits.filter((s) => !named.has(s.trace));
  const held = nameHolds(loose, submission);
  namingAttempts += 1;
  log({ type: 'naming', night, submission, held });
  if (held) {
    named.add(submission.trace);
    message = `The name held. ${traitName(POOLS.trace, submission.trace)} is named and works the house.`;
    if (named.size === spiritCount) {
      log({
        type: 'run-end',
        nights: night - 1,
        named: named.size,
        spiritCount,
        namingAttempts,
      });
      mode = { kind: 'done' };
      return;
    }
  } else {
    message = 'The name did not hold.';
  }
  mode = { kind: 'menu' };
}

function onKey(key: string): void {
  if (key === 'q' || key === '') {
    if (mode.kind !== 'done') {
      log({
        type: 'run-end',
        nights: night - 1,
        named: named.size,
        spiritCount,
        namingAttempts,
        abandoned: true,
      });
    }
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    console.clear();
    console.log(
      `Run over. seed ${seed}, ${named.size}/${spiritCount} named in ${night - 1} nights, ${namingAttempts} naming attempts.`,
    );
    console.log(`Every night is in ${logPath}`);
    process.exit(0);
  }

  if (key === '') {
    if (mode.kind !== 'menu' && mode.kind !== 'done') {
      mode = { kind: 'menu' };
      message = 'Cancelled.';
    }
    return;
  }

  if (mode.kind === 'menu') {
    const room = digit(key, 4);
    if (room !== null) {
      const roomValue = at(POOLS.haunt, room - 1);
      if (cap !== null && tonight.size >= cap && !tonight.has(roomValue.id)) {
        message = `Only ${cap} experiment${cap === 1 ? '' : 's'} a night. Clear a room first.`;
        return;
      }
      mode = { kind: 'experiment', room: roomValue, step: 'candle' };
      message = `Setting up ${roomValue.name}.`;
    } else if (key === 'c') {
      if (tonight.size === 0) message = 'Nothing to clear.';
      else mode = { kind: 'clear' };
    } else if (key === 's') {
      sleep();
    } else if (key === 'n') {
      if (seenTraces().filter((t) => !named.has(t)).length === 0) {
        message = 'No loose spirit has shown itself yet. Nothing to name.';
      } else {
        mode = { kind: 'naming', step: 'trace', draft: {} };
        message = 'Name a spirit. All four traits at once, or not at all.';
      }
    }
    return;
  }

  if (mode.kind === 'clear') {
    const room = digit(key, 4);
    if (room !== null) {
      const roomValue = at(POOLS.haunt, room - 1);
      tonight.delete(roomValue.id);
      message = `${roomValue.name} goes dark.`;
      mode = { kind: 'menu' };
    }
    return;
  }

  if (mode.kind === 'experiment') {
    if (mode.step === 'candle') {
      const candle = digit(key, 4);
      if (candle !== null) mode = { ...mode, step: 'lure', candle };
    } else if (mode.step === 'lure') {
      const lure = digit(key, 4);
      if (lure !== null)
        mode = { ...mode, step: 'ward', lure: at(POOLS.lure, lure - 1).id };
    } else {
      const ward = key === '0' ? 0 : digit(key, 4);
      if (
        ward !== null &&
        mode.candle !== undefined &&
        mode.lure !== undefined
      ) {
        tonight.set(mode.room.id, {
          room: mode.room.id,
          candle: mode.candle,
          lure: mode.lure,
          ward: ward === 0 ? null : at(POOLS.aversion, ward - 1).id,
        });
        message = `${mode.room.name} is set.`;
        mode = { kind: 'menu' };
      }
    }
    return;
  }

  if (mode.kind === 'naming') {
    const draft = { ...mode.draft };
    if (mode.step === 'trace') {
      const options = seenTraces().filter((t) => !named.has(t));
      const choice = digit(key, options.length);
      if (choice !== null) {
        draft.trace = at(options, choice - 1);
        mode = { kind: 'naming', step: 'hour', draft };
      }
    } else {
      const choice = digit(key, 4);
      if (choice === null) return;
      if (mode.step === 'hour') {
        draft.hour = at(POOLS.hour, choice - 1).id;
        mode = { kind: 'naming', step: 'lure', draft };
      } else if (mode.step === 'lure') {
        draft.lure = at(POOLS.lure, choice - 1).id;
        mode = { kind: 'naming', step: 'aversion', draft };
      } else if (mode.step === 'aversion') {
        draft.aversion = at(POOLS.aversion, choice - 1).id;
        mode = { kind: 'naming', step: 'haunt', draft };
      } else {
        draft.haunt = at(POOLS.haunt, choice - 1).id;
        submitName(draft);
      }
    }
    return;
  }
}

if (process.stdin.isTTY) process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk: string) => {
  for (const key of chunk) onKey(key);
  render();
});

render();
