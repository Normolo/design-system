#!/usr/bin/env node
'use strict';
// PostToolUse hook: after Claude edits a file, if that file is one of the
// app's design targets (or anything under design/), run the app's own
// `node design/sync.js --check`. On a problem, exit 2 so Claude sees the
// report and fixes it in the same turn. Apps without design/ are left alone.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', (d) => { input += d; });
process.stdin.on('end', () => {
  let event = {};
  try { event = JSON.parse(input || '{}'); } catch (e) { process.exit(0); }
  const root = process.env.CLAUDE_PROJECT_DIR || event.cwd || process.cwd();
  const sync = path.join(root, 'design', 'sync.js');
  const cfgPath = path.join(root, 'design', 'design.json');
  if (!fs.existsSync(sync) || !fs.existsSync(cfgPath)) process.exit(0);

  const file = event.tool_input && event.tool_input.file_path;
  if (file) {
    const rel = path.relative(root, path.resolve(root, file)).split(path.sep).join('/');
    let targets = [];
    try { targets = Object.keys(JSON.parse(fs.readFileSync(cfgPath, 'utf8')).targets || {}); } catch (e) { /* check reports it */ }
    if (!rel.startsWith('design/') && targets.indexOf(rel) === -1) process.exit(0);
  }

  const r = spawnSync(process.execPath, [sync, '--check'], { cwd: root, encoding: 'utf8' });
  if (r.status === 0) process.exit(0);
  process.stderr.write((r.stderr || '') + (r.stdout || '') +
    '\nFix these before moving on (rules: design/DESIGN.md).\n');
  process.exit(2);
});
