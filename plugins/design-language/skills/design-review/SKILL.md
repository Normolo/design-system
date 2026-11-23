---
name: design-review
description: Review UI changes, or a named page or file, against the shared design language and list every place it drifts.
disable-model-invocation: true
argument-hint: "[file, page or 'diff' (default)]"
---

# Design review

Review `$ARGUMENTS` (if empty: the uncommitted diff plus the commits on this
branch that aren't on the default branch) against `design/DESIGN.md`.

1. Run `node design/sync.js --check` and include anything it reports.
2. Read the changed CSS, HTML and JS that renders UI. For each rule in
   DESIGN.md, look for breaches:
   - raw colours or colours chosen in JS instead of read from CSS
   - a status shown in a colour that doesn't mean that status, or a second green
   - font sizes off the scale, radii not from the radius tokens, spacing off the 4px grid
   - uppercase or letter-spaced labels, card outlines, numbers without tabular numerals
   - a top bar, card, button or pill that doesn't match the component rules
   - missing light-theme behaviour (anything hard-wired to dark)
   - animation without a reduced-motion fallback, focus that isn't visible
3. Report as a list: `file:line`, what's wrong, the token or pattern to use.
   Most severe first. Say plainly if there's nothing to report.

Don't change any files unless asked to fix them.
