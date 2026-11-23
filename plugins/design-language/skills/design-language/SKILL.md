---
name: design-language
description: The shared design language (tokens, colours, type, components) for Normolo's apps. Use for any UI work in an app that has a design/ folder — new or changed pages, components, CSS, colours, charts, layout, typography, theming, or making something "look like the other app".
---

# Working on UI with the shared design language

The rules are in the app's `design/DESIGN.md` (also imported by its CLAUDE.md).
If it isn't already in context, read it first. If the app has no `design/`
folder yet, the canonical copy is `${CLAUDE_SKILL_DIR}/../../DESIGN.md` — and
the app should be adopted with `/design-language:design-sync`.

## Before you write CSS

1. Find the app's alias block right after the token block (the app's own names
   for `--ds-*` tokens, e.g. `--hair: var(--ds-border)`). Use those names where
   the surrounding code does, `--ds-*` directly in new code.
2. Look at the nearest existing component of the same kind and match it, so the
   pattern stays one pattern.

## While you write

- Colours only through tokens or aliases. JavaScript that needs a colour reads
  it from CSS (`getComputedStyle(document.documentElement).getPropertyValue('--ds-good')`)
  so it follows the theme. Never paste a hex value into JS or CSS.
- Font sizes from the scale, radii from the radius tokens, spacing on the 4px grid.
- Sentence-case labels, tabular numerals, no card outlines.

## After

1. Run `node design/sync.js --check`. Fix what it reports. If it says you
   removed raw colours, lower `maxRawColours` in `design/design.json` as it asks.
2. Run the app's own tests (see its CLAUDE.md).
3. If you can render the page, look at it in both themes.

## When the design language itself should change

A new colour, a different radius, a changed rule: that is a change to
Normolo/design-system, not to this app. Don't add it locally; describe the
change and say it needs a design-system release, then
`/design-language:design-sync` in each app.
