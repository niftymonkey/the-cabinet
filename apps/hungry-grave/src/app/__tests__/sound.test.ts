/**
 * The game's voice (plan 6.22). It subscribes to the event list and nothing
 * else, and holds no game rules of its own.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The music channel is the engine's BGM, and the no-op on an unchanged alias
 * this file asserts is that class's own. Standing it up under node means
 * standing in for the two packages it reaches: the sound library it finds a
 * track in, and the tween it fades with.
 */
const { tracks } = vi.hoisted(() => ({
  tracks: new Map<
    string,
    { started: number; play: () => void; volume: number; stop: () => void }
  >(),
}));

vi.mock('@pixi/sound', () => ({
  sound: {
    find: (alias: string) => {
      const found = tracks.get(alias);
      if (found !== undefined) return found;
      const track = {
        started: 0,
        volume: 1,
        play: () => {
          track.started += 1;
        },
        stop: () => {},
      };
      tracks.set(alias, track);
      return track;
    },
  },
}));

vi.mock('motion', () => ({ animate: () => Promise.resolve() }));

import { BGM } from '../../engine/audio/audio';
import type { SimEvent } from '../../game/events';
import { createRun } from '../../game/run';
import { PHASES, phaseUnderway } from '../../game/stage/stage';
import manifest from '../../manifest.json';
import type { MusicOutput } from '../sound';
import {
  clipFor,
  LOOPS,
  MUSIC_BUNDLE,
  musicFor,
  playFor,
  playMusicFor,
} from '../sound';

const SRC = resolve(import.meta.dirname, '..', '..');

/** One of every event the sim can emit, so the ignored ones are checked as a set. */
const EVERY_EVENT: SimEvent[] = [
  { type: 'swallowed', kind: 'corpse', freshness: 1, payout: 1 },
  { type: 'chimed', kind: 'corpse' },
  { type: 'chimed', kind: 'drop' },
  { type: 'chimed', kind: 'feast' },
  { type: 'grew', amount: 1, size: 20 },
  { type: 'overflowed', amount: 1, score: 1 },
  { type: 'reservoirCharged', amount: 1, reservoir: 1 },
  { type: 'splashed', wasted: 1, reservoir: 1 },
  { type: 'reservoirFull', reservoir: 1 },
  { type: 'weaponLeveled', line: 'bell', level: 2 },
  { type: 'graveHit', source: 'contact', size: 20, invulnerable: 24 },
  { type: 'mobDamaged', id: 7, amount: 1, source: 'bell' },
  { type: 'scoreBled', amount: 5 },
  { type: 'weaponStripped', lines: ['bell'] },
  { type: 'sealed', tick: 10 },
  { type: 'victory', tick: 10 },
  { type: 'mobKilled', id: 7, mob: 'shambler', x: 1, y: 2, carried: false },
  { type: 'carrierLost', mob: 'shambler', x: 1, reason: 'leftField' },
  { type: 'mobFired', emitter: 'shambler', kind: 'trash', x: 1, y: 2 },
  { type: 'corpseExpired', x: 1, y: 2 },
  { type: 'corpseLost', kind: 'corpse', x: 1, y: 2, freshness: 0.5 },
  { type: 'tolled', level: 3, radius: 165 },
  { type: 'belched', cancelled: 12, killed: 4 },
  { type: 'dropSpawned', id: 9, line: 'wisps', x: 1, y: 2 },
  { type: 'phaseChanged', phase: 'crowd', music: 'crowd', tick: 10 },
];

describe('which events make a sound (plan 6.22)', () => {
  it('reacts to chimed, tolled, graveHit and belched, and ignores every other event', () => {
    const heard = EVERY_EVENT.filter((event) => clipFor(event) !== null).map(
      (event) => event.type,
    );
    expect(new Set(heard)).toEqual(
      new Set(['chimed', 'tolled', 'graveHit', 'belched']),
    );
  });

  it('covers five clips, because coverage is the point rather than the count', () => {
    // An earlier shape shipped two and both landed on the two commonest events
    // in the game while the scarcest objects stayed silent: a drop sounded
    // exactly like a corpse and the belch made no noise at all.
    const clips = new Set(
      EVERY_EVENT.map(clipFor).filter((clip) => clip !== null),
    );
    expect(clips).toEqual(
      new Set(['swallow', 'treasure', 'toll', 'hit', 'eruption']),
    );
  });
});

describe('the swallow chime and the treasure chime (plan 6.22)', () => {
  it('chimes for a corpse and for a feast, from the very first swallow whatever the loadout', () => {
    // The headline criterion that stops an unlucky drop sequence leaving the
    // early minutes silent.
    expect(clipFor({ type: 'chimed', kind: 'corpse' })).toBe('swallow');
    expect(clipFor({ type: 'chimed', kind: 'feast' })).toBe('swallow');
  });

  it('plays a different clip for a drop, chosen from the kind the event already carries', () => {
    // The scarcest object in the game must not sound like the commonest, and
    // this needs no event change and no game rule here: Chimed already carries
    // the food's kind.
    expect(clipFor({ type: 'chimed', kind: 'drop' })).toBe('treasure');
    expect(clipFor({ type: 'chimed', kind: 'drop' })).not.toBe(
      clipFor({ type: 'chimed', kind: 'corpse' }),
    );
  });
});

/** A clip that is not there: what @pixi/sound does with an unloaded alias. */
const missingClip = {
  play: () => {
    throw new Error('Cannot find sound');
  },
};

describe('a clip that will not play', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('a clip that will not play is not silent', async () => {
    // A fresh module per test, because the report is once per session.
    const { playFor } = await import('../sound');

    playFor(missingClip, { type: 'chimed', kind: 'corpse' });

    const said = vi
      .mocked(console.warn)
      .mock.calls.map((call) => call.map(String).join(' '));
    expect(said).toHaveLength(1);
    // What happened, and what it costs.
    expect(said[0]).toContain('swallow');
    expect(said[0]).toContain('silence');
  });

  it('reports once, not once per event', async () => {
    const { playFor } = await import('../sound');

    for (let event = 0; event < 500; event += 1) {
      playFor(missingClip, { type: 'chimed', kind: 'corpse' });
    }

    expect(console.warn).toHaveBeenCalledTimes(1);
  });
});

/**
 * Every alias the voice can ask for, gathered by playing one of every event
 * through the module's own seam rather than read off the clip table, so what is
 * checked is what a run would actually hand the effects channel.
 */
const aliasesTheVoicePlays = (): string[] => {
  const played: string[] = [];
  const recorder = { play: (alias: string): void => void played.push(alias) };
  for (const event of EVERY_EVENT) playFor(recorder, event);
  return played;
};

/** The aliases a bundle registers: @pixi/sound takes the first of each list. */
const aliasesInBundle = (name: string): string[] => {
  const bundle = manifest.bundles.find((entry) => entry.name === name);
  if (!bundle) return [];
  return bundle.assets.map((asset) => {
    const alias = asset.alias[0];
    if (alias === undefined) throw new Error(`${asset.src} has no alias`);
    return alias;
  });
};

describe('the clips a run asks for', () => {
  it('every clip the voice plays is in the bundle a sounding screen loads', () => {
    // This is why a clip still loading is not the case playFor's catch sees.
    // Navigation awaits a screen's assetBundles before constructing it, and the
    // screens that make sound declare 'main', so the aliases below are
    // registered before the first swallow can land. A clip that leaves this
    // bundle turns that unreachable path into a real defect, and the only thing
    // that would say so is a console warning nobody is watching for.
    const registered = aliasesInBundle('main');
    const played = aliasesTheVoicePlays();

    expect(played.length).toBeGreaterThan(0);
    for (const alias of played) {
      expect(`${alias}: ${registered.includes(alias)}`).toBe(`${alias}: true`);
    }
  });
});

/**
 * Every crossing a run makes, in order, each built by the stage's own
 * announcement rather than restated here, so what these tests read is what the
 * sim says and not a second copy of the phase table.
 */
const everyCrossing = (): SimEvent[] => {
  const run = createRun(20260908);
  return PHASES.map((_, index) => {
    run.stage.phaseIndex = index;
    return phaseUnderway(run);
  });
};

/** The loop each phase asks for, in phase order, and null where none is asked. */
const loopPerPhase = (): (string | null)[] => everyCrossing().map(musicFor);

/** Where a phase's loop differs from the one before it: an audible change. */
const changedAt = (loops: readonly (string | null)[]): number[] =>
  loops.flatMap((loop, at) =>
    at > 0 && loop !== null && loop !== loops[at - 1] ? [at] : [],
  );

describe('the section music (spec 58, module 108, 131)', () => {
  beforeEach(() => tracks.clear());

  it('gives every loop a phase names a file, and names every file it has from a phase', () => {
    // Both directions, which is what makes six loops the same edit as three: a
    // phase naming a loop with no file does not compile, and a file no phase
    // asks for is dead weight nobody would hear was missing.
    const named = new Set(
      PHASES.map((phase) => phase.music).filter((loop) => loop !== null),
    );
    expect(named.size).toBeGreaterThan(0);
    expect(new Set(Object.keys(LOOPS))).toEqual(named);
  });

  it('ships every loop in its own bundle, so a filename that drifts is caught here', () => {
    // The clip table's own guard, one bundle over: nothing else can tell a
    // typed filename from a file that is really missing, because a loop that
    // will not play sounds exactly like a section that plays nothing.
    const registered = aliasesInBundle(MUSIC_BUNDLE);
    expect(registered.length).toBeGreaterThan(0);
    for (const file of Object.values(LOOPS)) {
      expect(`${file}: ${registered.includes(file)}`).toBe(`${file}: true`);
    }
  });

  it('names one loop per phase, three across the seven, and none for the ending', () => {
    // ADR 0049: the stand-in music enters V1 as the thing that makes a section
    // tellable. The over phase plays nothing, because the fade out is the
    // ending.
    const loops = loopPerPhase();
    expect(loops).toHaveLength(PHASES.length);
    expect(new Set(loops.filter((loop) => loop !== null)).size).toBe(3);
    expect(loops.at(-1)).toBeNull();
  });

  it('changes its loop twice in a run, on the Banshee falling and on the eye opening', () => {
    // Decision 22's amendment names two music changes and where they fall. The
    // test reads where they fall out of the phase before each change rather
    // than out of a phase name: what ends the phase the loop changed after is
    // the boundary event, so a table that moved a loop would land here.
    const changes = changedAt(loopPerPhase());
    expect(changes).toHaveLength(2);
    const [firstChange, secondChange] = changes;
    if (firstChange === undefined || secondChange === undefined) {
      throw new Error('changedAt did not report both changes');
    }

    const banshee = PHASES[firstChange - 1];
    if (banshee === undefined)
      throw new Error('no phase before the first change');
    expect(banshee.ends).toBe('bossKilled');
    expect(banshee.boss).toBe('banshee');

    const crowd = PHASES[secondChange - 1];
    if (crowd === undefined)
      throw new Error('no phase before the second change');
    expect(crowd.ends).toBe('setPieceOpened');
  });

  it('issues the cue on every phase change, including the ones that ask for the loop already playing', () => {
    // The app never decides what counts as a change: it says what the phase
    // asks for on every crossing and the engine answers. A cue skipped here is
    // a section that opens on the loop before it after any retune of the table.
    const asked: string[] = [];
    const recorder: MusicOutput = { play: (alias) => void asked.push(alias) };

    for (const crossing of everyCrossing()) playMusicFor(recorder, crossing);

    const sounding = PHASES.filter((phase) => phase.music !== null);
    expect(asked).toHaveLength(sounding.length);
    expect(asked[0]).toBe(asked[1]);
  });

  it('turns those cues into two audible changes and never seven', () => {
    // The other half of the same sentence, through the engine's own BGM: it
    // makes a play call on an unchanged alias a no-op, so the six cues above
    // start three tracks, the run's opening loop and the two changes.
    const bgm = new BGM();
    const channel: MusicOutput = { play: (alias) => void bgm.play(alias) };

    for (const crossing of everyCrossing()) playMusicFor(channel, crossing);

    const started = [...tracks.values()].map((track) => track.started);
    expect(started).toEqual([1, 1, 1]);
    expect([...tracks.keys()]).toEqual([
      LOOPS.procession,
      LOOPS.crowd,
      LOOPS.waking,
    ]);
  });
});

/**
 * Every production module under src, by absolute path.
 *
 * Prototypes are outside every fence in this repo (ADR 0010) and test files are
 * outside this one, because this file names the encoder tags below so a reader
 * can see what is being forbidden.
 */
const productionModulesUnder = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === 'prototypes' || name === '__tests__') return [];
      return productionModulesUnder(path);
    }
    return name.endsWith('.ts') ? [path] : [];
  });

/**
 * What an encoder-header parse cannot be written without: the container tag
 * names, the gapless fields an encoder writes, and the sample count of one
 * MPEG layer III frame, which is the only way a frame count becomes a length.
 * None of the nine has another use in this game.
 */
const ENCODER_HEADER_MARKS: readonly (readonly [string, RegExp])[] = [
  ['the Xing tag', /\bXing\b/],
  ['the VBRI tag', /\bVBRI\b/],
  ['the LAME extension', /\bLAME\b/],
  ['the Ogg page magic', /\bOggS\b/],
  ['an ID3 tag', /\bID3\b/],
  ["a layer III frame's 1152 samples", /\b1152\b/],
  ['an encoder delay', /encoderDelay/],
  ['an encoder padding', /encoderPadding/],
  ['an Ogg granule position', /granulePosition/],
];

/** Which marks of a header parse a source carries, by name. */
const headerParseMarksIn = (source: string): string[] =>
  ENCODER_HEADER_MARKS.filter(([, mark]) => mark.test(source)).map(
    ([name]) => name,
  );

describe('no loop is trimmed by a header parse (module 129)', () => {
  it('parses no audio encoder header anywhere in the app', () => {
    // The deliberate-absence guard for the trim that is not built. An earlier
    // draft of this step's plan would have decoded a loop, read the encoder's
    // delay and padding out of its header and sliced the buffer by them, on the
    // premise that decodeAudioData hands back an untrimmed buffer. Verification
    // step 13 measured that premise and it is stale: in Chromium, off the files
    // the built app serves, each of the six decodes to exactly the length its
    // own header states minus the delay and the padding, and the longest quiet
    // run at a wrap is 27 samples of one loop's own first note. A parse here
    // would be a decoder shipped inside a game to work around a browser bug
    // that no longer exists.
    const modules = productionModulesUnder(SRC);
    expect(modules.length).toBeGreaterThan(0);

    const found = modules.flatMap((path) =>
      headerParseMarksIn(readFileSync(path, 'utf8')).map(
        (mark) => `${path.slice(SRC.length + 1)} reads ${mark}`,
      ),
    );
    expect(found).toEqual([]);
  });

  it('catches a parse planted in a module, so the absence is a rule', () => {
    // The sweep is the detector plus the file list, so both halves are proved:
    // every line a parse would need is caught, and the walk really does reach
    // the three modules a parse would be written in.
    const planted = [
      "const tag = bytes.toString('latin1', at, at + 4) === 'Xing';",
      "if (header.slice(0, 4) === 'OggS') return granuleOf(header);",
      'const samples = frames * 1152;',
      'const start = buffer.encoderDelay / buffer.sampleRate;',
    ];
    for (const line of planted) {
      expect(`${line}: ${headerParseMarksIn(line).length}`).not.toBe(
        `${line}: 0`,
      );
    }

    const walked = productionModulesUnder(SRC).map((path) =>
      path.slice(SRC.length + 1),
    );
    for (const path of ['app/sound.ts', 'main.ts', 'engine/audio/audio.ts']) {
      expect(`${path}: ${walked.includes(path)}`).toBe(`${path}: true`);
    }
  });

  it('hands the channel the file its row names and nothing worked out at play time', () => {
    // The other half of the sentence, and the half that would still hold had
    // the measurement gone the other way: a loop that needs gapless points
    // declares them as a start and an end in seconds beside its file in LOOPS,
    // which BGM.play passes straight through to the source node's loopStart and
    // loopEnd (@pixi/sound WebAudioInstance.mjs:173-174). No loop has any, so
    // the cue is one argument today. What this forbids either way is a value
    // the app worked out for itself, which is what a parse would produce.
    const calls: unknown[][] = [];
    const recorder: MusicOutput = {
      play: (alias: string, ...rest: unknown[]) =>
        void calls.push([alias, ...rest]),
    };

    for (const crossing of everyCrossing()) playMusicFor(recorder, crossing);

    const rows = new Set<unknown>(Object.values(LOOPS));
    expect(calls.length).toBeGreaterThan(0);
    for (const args of calls) {
      expect(`${String(args[0])}: ${args.length}`).toBe(
        `${String(args[0])}: 1`,
      );
      expect(`${String(args[0])}: ${rows.has(args[0])}`).toBe(
        `${String(args[0])}: true`,
      );
    }
  });
});

describe('it holds no game rule (plan 6.22)', () => {
  it('plays the same clip for the same event, whatever the run state is', () => {
    // A pure function of the event. There is no run to vary, which is the
    // property: the events carry values for exactly this reason.
    const event: SimEvent = { type: 'tolled', level: 1, radius: 80 };
    expect(clipFor(event)).toBe(clipFor(event));
    expect(clipFor({ type: 'tolled', level: 5, radius: 250 })).toBe(
      clipFor(event),
    );
  });

  it('keeps its imports inside the boundary rule that governs it', () => {
    // src/boundary.test.ts holds this mechanically; this is the readable half,
    // so a reader of the module sees what it is allowed to reach.
    const source = readFileSync(join(SRC, 'app', 'sound.ts'), 'utf8');
    const specifiers = [...source.matchAll(/from\s+'([^']+)'/g)].map(
      (match) => {
        const specifier = match[1];
        if (specifier === undefined) {
          throw new Error('import regex matched with no captured specifier');
        }
        return specifier;
      },
    );
    expect(specifiers.length).toBeGreaterThan(0);
    for (const specifier of specifiers) {
      const inside =
        !specifier.startsWith('../game') || specifier === '../game/events';
      expect(`${specifier}: ${inside}`).toBe(`${specifier}: true`);
    }
  });
});
