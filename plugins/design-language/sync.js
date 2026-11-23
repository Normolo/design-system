#!/usr/bin/env node
'use strict';
// design-system v1.0.0 -- copied from Normolo/design-system, do not edit here.
//
// Keeps this app on the shared design language. The app's copy of the tokens
// is design/tokens.css; every file listed in design/design.json carries that
// exact text between the design-system markers, so a page needs nothing but
// its own <style> to get the tokens (no build step, no extra request).
//
//   node design/sync.js                  write design/tokens.css into every target
//   node design/sync.js --check          exit 1 if anything is off (the tests run this)
//   node design/sync.js --from <dir>     take a new release first: tokens.css,
//                                        DESIGN.md and sync.js from <dir>
//   node design/sync.js --count          raw colours per target (to set allowances)
//
// --check fails when:
//   - a target's token block differs from design/tokens.css (edited by hand,
//     or a new release copied in without running sync);
//   - tokens.css, DESIGN.md and this script are from different releases;
//   - a target has more raw colours (#hex, rgb(), rgba()) outside its token
//     block than its "maxRawColours" in design.json -- new colours come from
//     tokens, so that number only ever goes down;
//   - a target uses text-transform: uppercase (labels are sentence case).

const fs = require('fs');
const path = require('path');

const VERSION = '1.0.0';
const DIR = __dirname;
const ROOT = path.resolve(DIR, '..');
const BEGIN = '/* ==== design-system tokens v';
const END = '/* ==== end design-system tokens ==== */';
const RAW_COLOUR = /(?<!&)#[0-9a-fA-F]{3,8}\b|\brgba?\(\s*\d/g;
const UPPERCASE = /text-transform\s*:\s*uppercase/g;

function read(p) { return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n'); }
function config() { return JSON.parse(read(path.join(DIR, 'design.json'))); }
function tokens() { return read(path.join(DIR, 'tokens.css')).trim(); }

function versionOf(text) {
  const m = text.match(/design-system(?: tokens)? v(\d+\.\d+\.\d+)/);
  return m ? m[1] : null;
}

// The token blocks in a file: [{ start, end }] as offsets, end exclusive.
function blocks(text) {
  const out = [];
  let from = 0;
  for (;;) {
    const s = text.indexOf(BEGIN, from);
    if (s === -1) return out;
    const e = text.indexOf(END, s);
    if (e === -1) { out.push({ start: s, end: -1 }); return out; }
    out.push({ start: s, end: e + END.length });
    from = e + END.length;
  }
}

function outside(text) {
  let rest = '';
  let at = 0;
  for (const b of blocks(text)) {
    if (b.end === -1) break;
    rest += text.slice(at, b.start);
    at = b.end;
  }
  return rest + text.slice(at);
}

function countRaw(text) { return (outside(text).match(RAW_COLOUR) || []).length; }

function write() {
  const t = tokens();
  const problems = [];
  for (const rel of Object.keys(config().targets)) {
    const file = path.join(ROOT, rel);
    const text = read(file);
    const bs = blocks(text);
    if (bs.length === 0) {
      problems.push(rel + ': no token block. Put the two marker lines where the tokens belong ' +
        '(first thing in its <style>), then run sync again:\n    ' + BEGIN + '0.0.0 */\n    ' + END);
      continue;
    }
    if (bs.some((b) => b.end === -1)) { problems.push(rel + ': a token block has no end marker'); continue; }
    let out = '';
    let at = 0;
    for (const b of bs) { out += text.slice(at, b.start) + t; at = b.end; }
    out += text.slice(at);
    if (out !== text) { fs.writeFileSync(file, out); console.log('updated ' + rel); }
    else console.log('unchanged ' + rel);
  }
  return problems;
}

function check() {
  const cfg = config();
  const t = tokens();
  const problems = [];
  const v = { 'tokens.css': versionOf(t), 'DESIGN.md': null, 'sync.js': VERSION };
  try { v['DESIGN.md'] = versionOf(read(path.join(DIR, 'DESIGN.md'))); } catch (e) { /* reported below */ }
  if (new Set(Object.values(v)).size !== 1) {
    problems.push('design/ holds files from different releases (' +
      Object.entries(v).map(([k, x]) => k + ' ' + (x || 'missing')).join(', ') +
      '). Copy all three from the same design-system release with: node design/sync.js --from <dir>');
  }
  for (const [rel, opts] of Object.entries(cfg.targets)) {
    const text = read(path.join(ROOT, rel));
    const bs = blocks(text);
    if (bs.length === 0) problems.push(rel + ': no design-system token block');
    for (const b of bs) {
      if (b.end === -1) { problems.push(rel + ': a token block has no end marker'); continue; }
      if (text.slice(b.start, b.end) !== t) {
        problems.push(rel + ': its token block differs from design/tokens.css. Never edit the block; ' +
          'change the token in Normolo/design-system, or run `node design/sync.js` if tokens.css was just updated.');
      }
    }
    const raw = countRaw(text);
    const max = opts.maxRawColours || 0;
    if (raw > max) {
      problems.push(rel + ': ' + raw + ' raw colours outside the token block, allowed ' + max + '. ' +
        'Use a --ds-* token (or an alias of one) instead of a new #hex/rgb(); if no token fits, the colour ' +
        'belongs in Normolo/design-system, not here.');
    } else if (raw < max) {
      problems.push(rel + ': ' + raw + ' raw colours, fewer than the ' + max + ' allowed -- lower ' +
        '"maxRawColours" for ' + rel + ' in design/design.json to ' + raw + ' so it stays down.');
    }
    const caps = (outside(text).match(UPPERCASE) || []).length;
    if (caps) problems.push(rel + ': text-transform: uppercase x' + caps + ' -- labels are sentence case.');
  }
  return problems;
}

function from(dir) {
  const src = path.resolve(dir);
  for (const f of ['tokens.css', 'DESIGN.md', 'sync.js']) {
    const p = path.join(src, f);
    if (!fs.existsSync(p)) throw new Error('no ' + f + ' in ' + src);
    fs.copyFileSync(p, path.join(DIR, f));
    console.log('copied ' + f + ' (' + (versionOf(read(p)) || '?') + ')');
  }
}

function main(argv) {
  let problems = [];
  if (argv[0] === '--count') {
    for (const rel of Object.keys(config().targets)) console.log(rel + ': ' + countRaw(read(path.join(ROOT, rel))));
    return 0;
  }
  if (argv[0] === '--from') {
    if (!argv[1]) { console.error('usage: node design/sync.js --from <dir with tokens.css, DESIGN.md, sync.js>'); return 2; }
    from(argv[1]);
    // The copied sync.js may be newer than this one: let it finish the job.
    const { spawnSync } = require('child_process');
    return spawnSync(process.execPath, [path.join(DIR, 'sync.js')], { stdio: 'inherit' }).status;
  }
  problems = argv[0] === '--check' ? check() : write();
  if (problems.length) {
    console.error('design-system: ' + problems.length + ' problem' + (problems.length > 1 ? 's' : '') + '\n  - ' + problems.join('\n  - '));
    return 1;
  }
  if (argv[0] === '--check') console.log('design-system v' + VERSION + ': all targets in step');
  return 0;
}

if (require.main === module) process.exit(main(process.argv.slice(2)));
module.exports = { check, write, countRaw, blocks, VERSION };
