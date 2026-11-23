'use strict';
// Guards on the design-system release itself. Run with: node --test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const PLUGIN = path.join(__dirname, '..', 'plugins', 'design-language');
const read = (f) => fs.readFileSync(path.join(PLUGIN, f), 'utf8');
const tokens = read('tokens.css');
const versionOf = (t) => (t.match(/design-system(?: tokens)? v(\d+\.\d+\.\d+)/) || [])[1];

// The three blocks of tokens.css: dark defaults, [data-theme="light"], and the
// prefers-color-scheme auto block. Returns { name: value } for each.
function block(re) {
  const m = tokens.match(re);
  assert.ok(m, 'block not found: ' + re);
  const out = {};
  for (const [, k, v] of m[1].matchAll(/(--ds-[a-z0-9-]+):\s*([^;]+);/g)) out[k] = v.trim();
  return out;
}
const dark = block(/:root \{([\s\S]*?)\n\}/);
const light = block(/\[data-theme="light"\] \{([\s\S]*?)\n\}/);
const auto = block(/html:not\(\[data-theme\]\) \{([\s\S]*?)\n  \}/);
const isColour = (v) => /^(#|rgba?\()/.test(v);

function lum(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
    .reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
}
function contrast(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

test('every file of the release carries the same version', () => {
  const plugin = JSON.parse(read('.claude-plugin/plugin.json')).version;
  const v = {
    'tokens.css': versionOf(tokens),
    'DESIGN.md': versionOf(read('DESIGN.md')),
    'sync.js': (read('sync.js').match(/const VERSION = '([^']+)'/) || [])[1],
    'sync.js header': versionOf(read('sync.js')),
    'plugin.json': plugin,
  };
  assert.strictEqual(new Set(Object.values(v)).size, 1, JSON.stringify(v));
  const changelog = fs.readFileSync(path.join(__dirname, '..', 'CHANGELOG.md'), 'utf8');
  assert.ok(changelog.includes('## v' + plugin), 'CHANGELOG.md has no entry for v' + plugin);
});

test('every colour token has a light value, and the auto block matches it', () => {
  const colours = Object.keys(dark).filter((k) => isColour(dark[k]));
  const missing = colours.filter((k) => !(k in light));
  assert.deepStrictEqual(missing, [], 'colour tokens with no light value');
  assert.deepStrictEqual(auto, light, 'the prefers-color-scheme block must equal [data-theme="light"]');
  const stray = Object.keys(light).filter((k) => !(k in dark));
  assert.deepStrictEqual(stray, [], 'light-only tokens');
});

test('the tokens can be pasted into HTML and JS template literals', () => {
  assert.ok(!/[`]|\$\{/.test(tokens), 'no backticks or ${ (apps inline the block in template strings)');
  assert.ok(!/https?:\/\//.test(tokens), 'no URLs (homelab-dashboard forbids external references)');
  assert.ok(!/text-transform\s*:\s*uppercase/.test(tokens));
  assert.ok(tokens.trim().endsWith('/* ==== end design-system tokens ==== */'));
});

test('exactly one green', () => {
  const greens = new Set();
  for (const [k, v] of Object.entries(dark)) {
    if (!/^#[0-9a-f]{6}$/i.test(v)) continue;
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(v.substr(i, 2), 16));
    if (g > r + 18 && g > b + 18) greens.add(v.toLowerCase() + ' (' + k + ')');
  }
  const hues = new Set([...greens].map((s) => s.split(' ')[0]));
  assert.ok(hues.size <= 2, 'dark greens: ' + [...greens].join(', ')); // good + its border shade
  assert.strictEqual(dark['--ds-pill-green'], dark['--ds-good']);
});

for (const [name, t] of [['dark', dark], ['light', light]]) {
  test(name + ' theme keeps its contrast', () => {
    for (const bg of ['--ds-bg', '--ds-surface', '--ds-card']) {
      assert.ok(contrast(t['--ds-text'], t[bg]) >= 7, '--ds-text on ' + bg);
      assert.ok(contrast(t['--ds-muted'], t[bg]) >= 3, '--ds-muted on ' + bg);
      for (const s of ['--ds-accent', '--ds-good', '--ds-warn', '--ds-bad']) {
        assert.ok(contrast(t[s], t[bg]) >= 3, s + ' on ' + bg + ': ' + contrast(t[s], t[bg]).toFixed(2));
      }
    }
  });
}
