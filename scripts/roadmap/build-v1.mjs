/**
 * Builds a published page from scripts/roadmap/v1.yaml.
 *
 * The YAML is the only source of facts. This file owns no facts: every string
 * it prints either comes from the YAML or is structure. Page prose lives in the
 * template beside the markup it introduces.
 *
 *   node scripts/roadmap/build-v1.mjs [outputKey]     default: road_to_v1
 *
 * It writes the HTML and stops. Nothing outside a Claude Code session can
 * publish an artifact, so a session takes the file from here.
 *
 * It also stamps the source it built from, so a build run inside a turn leaves
 * the Stop hook nothing left to announce.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createRequire } from 'node:module';

import { publishInstruction } from '../../local/publish-instruction.mjs';
import { SOURCE, sourceHash, recordHash } from './v1-stamp.mjs';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml');

const d = yaml.load(readFileSync(SOURCE, 'utf8'));
const outKey = process.argv[2] ?? 'road_to_v1';
const out = d.outputs[outKey];
if (!out) throw new Error(`no output named ${outKey} in ${SOURCE}`);

// ---------------------------------------------------------------- text

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

/**
 * Data is escaped, then the one markup mark the source is allowed to carry
 * (*emphasis*) becomes bold. Escaping first means the source can never inject
 * markup by accident.
 */
function t(str) {
  return String(str ?? '')
    .replace(/[&<>]/g, (c) => ESC[c])
    .replace(/\*([^*]+)\*/g, '<b>$1</b>')
    .replace(/\/\//g, '<br>')
    .trim();
}

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
  'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function words(n) {
  if (n < 20) return ONES[n];
  const rest = n % 10;
  return TENS[Math.floor(n / 10)] + (rest ? '-' + ONES[rest] : '');
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------------------------------------------------------------- counts

const byState = (list) => list.reduce((m, x) => (m[x.state] = (m[x.state] ?? 0) + 1, m), {});
const totals = byState(d.promises);
const fogCount = d.fog_groups.reduce((n, g) => n + g.items.length, 0);

/** The tally is a hand-written self-check. A mismatch means a fact was dropped. */
function checkTally() {
  const seen = {
    promises_total: d.promises.length,
    adr_failures: d.adr_failures.length,
    work_cards: d.work.length,
    fog_items: fogCount,
  };
  const bad = Object.entries(seen).filter(([k, v]) => d.tally[k] !== v);
  for (const [k, v] of Object.entries(totals)) {
    if (d.tally.by_state[k] !== v) bad.push([`by_state.${k}`, v]);
  }
  // by_primary is what guards the counting trap the header describes: a promise
  // filed under the wrong source section still totals 29 and still reads right.
  const primaries = d.promises.reduce((m, p) => (m[p.primary] = (m[p.primary] ?? 0) + 1, m), {});
  for (const [k, v] of Object.entries(primaries)) {
    if (d.tally.by_primary[k] !== v) bad.push([`by_primary.${k}`, v]);
  }
  if (bad.length) {
    throw new Error('tally disagrees with the data: ' +
      bad.map(([k, v]) => `${k} counts ${v}`).join('; ') + '. Fix one side before building.');
  }
  // The template hardcodes five theme columns, so any other count silently
  // drops or orphans work cards.
  if (d.themes.length !== 5) {
    throw new Error(`the template draws exactly five theme columns and themes lists ` +
      `${d.themes.length}. Fix one side before building.`);
  }
  // A `when` outside when_values renders as an unstyled card.
  const badWhen = d.work.filter((w) => !d.when_values.includes(w.when));
  if (badWhen.length) {
    throw new Error('work cards carry a when outside when_values: ' +
      badWhen.map((w) => `${w.id} says ${w.when}`).join('; ') + '. Fix one side before building.');
  }
}

// ---------------------------------------------------------------- pieces

const ticketLink = (n) =>
  `<a class="tix" href="${d.meta.ticket_url_base}${n}" target="_blank" rel="noopener">#${n}</a>`;

function cols() {
  return d.themes.map((theme) => {
    const cards = d.work.filter((w) => w.theme === theme.key).map((w) =>
      `              <div class="card c-${w.when}" id="${w.id}">` +
      `<div class="chead"><span class="when">${cap(w.when)}</span>${ticketLink(w.ticket)}</div>` +
      `<div class="what">${t(w.title)}</div>` +
      `<div class="note">${t(w.note)}</div></div>`
    ).join('\n');
    return `            <div class="col">\n` +
      `              <div class="spine"></div>\n` +
      `              <div class="thead">${t(theme.label)}<small>${t(theme.blurb)}</small></div>\n` +
      `${cards}\n            </div>`;
  }).join('\n\n');
}

function builtBoxes() {
  return d.built.map((b) =>
    `              <div class="bbox">\n` +
    `                <h4>${t(b.title)}</h4>\n` +
    `                <p>${t(b.note)}</p>\n` +
    `                <div class="src">${t(b.source)}</div>\n` +
    `              </div>`
  ).join('\n');
}

const STATE_CLASS = { kept: 'met', part: 'part', open: 'open', not_met: 'fail' };

function stateKey() {
  const counts = { ...totals, not_met: d.adr_failures.length };
  return ['kept', 'part', 'open', 'not_met'].map((k) => {
    const s = d.states[k];
    return `          <div class="skbox sk-${STATE_CLASS[k]}">` +
      `<div class="w">${s.label.toUpperCase()} · ${counts[k]}</div>` +
      `<div class="d">${t(s.blurb)}</div></div>`;
  }).join('\n');
}

function promiseSects() {
  const order = ['kept', 'part', 'open'];
  const sects = Object.entries(d.sources).map(([key, src]) => {
    const mine = d.promises.filter((p) => p.primary === key);
    const counts = byState(mine);
    const meter = order.filter((k) => counts[k])
      .map((k) => `<i class="m-${STATE_CLASS[k]}" style="flex:${counts[k]}"></i>`).join('');
    const bundles = order.filter((k) => counts[k]).map((k) => {
      const chips = mine.filter((p) => p.state === k).map((p) =>
        `                  <div class="pchip"><div class="t">${t(p.short)}</div>` +
        `<div class="n">${t(p.gloss)}</div></div>`
      ).join('\n');
      return `              <div class="bundle bl-${STATE_CLASS[k]}">\n` +
        `                <div class="blhead"><span>${d.states[k].label}</span><b>${counts[k]}</b></div>\n` +
        `                <div class="chips">\n${chips}\n                </div>\n              </div>`;
    }).join('\n');
    const foot = src.footnote
      ? `\n            <p class="sectfoot">${t(src.footnote)}</p>` : '';
    return `          <div class="sect">\n` +
      `            <div class="secthead">\n` +
      `              <h3>${t(src.heading)}</h3>\n` +
      `              <span class="from">${t(src.caption)} · ${mine.length}</span>\n` +
      `              <span class="meter">${meter}</span>\n` +
      `            </div>\n` +
      `            <div class="bundles">\n${bundles}\n            </div>${foot}\n          </div>`;
  }).join('\n\n');

  const fails = d.adr_failures.map((f) =>
    `              <div class="failcard">\n` +
    `                <div class="t"><span class="failtag">${d.states.not_met.label}</span>${t(f.short)}</div>\n` +
    `                <div class="n">${t(f.note)}</div>\n` +
    `              </div>`
  ).join('\n');

  return sects + `\n\n          <div class="sect failing">\n` +
    `            <div class="secthead">\n` +
    `              <h3>Shipped, and wrong</h3>\n` +
    `              <span class="from">ADR rules · ${d.adr_failures.length}</span>\n` +
    `            </div>\n` +
    `            <div class="failrow">\n${fails}\n            </div>\n          </div>`;
}

function stamp() {
  return `          Drawn from ${SOURCE}.<br>\n` +
    `          Ticket state is read from the tracker and is never typed into that file.`;
}

const HOME_LABEL = { ticket: 'Ticket', inside: 'Inside', waits_on: 'Waits on' };

function fogGroups() {
  return d.fog_groups.map((g) => {
    const how = g.how ? `<span class="how">${t(g.how)}</span>` : '';
    const cards = g.items.map((i) =>
      `              <div class="fcard">\n` +
      `                <h4>${t(i.title)}</h4>\n` +
      `                <p>${t(i.note)}</p>\n` +
      `                <div class="by"><b>${HOME_LABEL[i.home.kind]}:</b> ${t(i.home.text)}</div>\n` +
      `              </div>`
    ).join('\n');
    return `          <div class="fgroup ${g.emphasis ? 'g-cand g-wide' : 'g-half'}">\n` +
      `            <div class="fghead"><h3>${t(g.heading)}</h3>` +
      `<span class="count">${g.items.length}</span>${how}</div>\n` +
      `            <div class="fcards">\n${cards}\n            </div>\n          </div>`;
  }).join('\n\n');
}

function offList() {
  return d.not_on_the_road.map((o) =>
    `            <li><b>${t(o.title)}</b> ${t(o.note)}</li>`).join('\n');
}

function blockedBy() {
  const rows = Object.entries(d.blocked_by)
    .map(([k, v]) => `    ${k}: [${v.map((x) => `'${x}'`).join(', ')}]`).join(',\n');
  // The template already carries the `var BLOCKED_BY = {` line and the closing
  // `var OPENS`, so only the rows and the brace belong here.
  return `${rows}\n  };`;
}

// ---------------------------------------------------------------- assemble

function build() {
  checkTally();
  const fills = {
    TITLE: t(out.title),
    BRAND_SUFFIX: t(out.brand_suffix),
    KEPT: String(totals.kept),
    TOTAL: String(d.promises.length),
    TOTAL_WORD: words(d.promises.length),
    FAIL_COUNT_WORD: words(d.adr_failures.length),
    FOG_COUNT_WORD: cap(words(fogCount)),
    CROWN_SUB: t(d.meta.v1_in_one_line),
    COLS: cols(),
    BUILT_BOXES: builtBoxes(),
    STATEKEY: stateKey(),
    PROMISE_SECTS: promiseSects(),
    STAMP: stamp(),
    FOG_GROUPS: fogGroups(),
    OFFLIST: offList(),
    BLOCKED_BY: blockedBy(),
  };

  let html = readFileSync(out.template, 'utf8');
  for (const [k, v] of Object.entries(fills)) html = html.split(`{{${k}}}`).join(v);

  const left = [...html.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
  if (left.length) throw new Error('template slot never filled: ' + [...new Set(left)].join(', '));

  mkdirSync(dirname(out.out), { recursive: true });
  writeFileSync(out.out, html);
  return html;
}

const html = build();
recordHash(process.cwd(), sourceHash(process.cwd()));
console.log(`wrote ${out.out}  (${html.length} bytes)`);
console.log(publishInstruction(out));
