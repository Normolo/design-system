<!-- design-system v1.0.0 -- copied from Normolo/design-system, do not edit here -->
# Design language

The look shared by every app built on Normolo/design-system (today: cashflow and
homelab-dashboard). Follow it for all UI work: new pages, components, styles and
fixes. Where an app's older code disagrees, the rules here win for anything you
touch.

## Tokens, never raw colours

- Colours, type, radii and spacing come from the `--ds-*` custom properties.
  Each stylesheet starts with the token block copied from `design/tokens.css`.
  Never edit that block. Never write a new `#hex`, `rgb()` or `rgba()` in app
  code: use a token, or an app alias that points at one (`--hair: var(--ds-border)`).
  `node design/sync.js --check` (run by the tests) fails on a new raw colour.
- No token fits? Then the colour is a design-system change, not an app change.
  Say so and propose it for Normolo/design-system instead of inventing one.
- Every token has a dark and a light value. Theme is `data-theme="light"|"dark"`
  on `<html>`, or no attribute to follow the OS. Don't write theme overrides for
  token colours in app CSS.

## What each colour means

- **Surfaces**: page `--ds-bg`; chrome (top bar, table heads, code blocks)
  `--ds-surface`; cards and panels `--ds-card`; a card that needs attention
  `--ds-card-alert`; hairlines `--ds-border`.
- **Text**: `--ds-text`, secondary `--ds-muted`, tertiary `--ds-faint`.
- **Accent** `--ds-accent`: links, the active nav item, primary buttons, focus.
  `--ds-accent-2` only as a second data series. `--ds-accent-tint` for a
  "just changed" or selected background.
- **Status, one colour per meaning**: `--ds-good` (ok, success, money in),
  `--ds-warn`, `--ds-bad`. There is exactly one green. Status backgrounds and
  borders use the matching `--ds-*-bg` / `--ds-*-border`, never a home-made alpha.
- **Offline / unknown** is not a status colour: `--ds-offline-bg` with muted text.
- **Categorical data** (chart series, tags), in this order: accent, accent-2,
  good, yellow, cyan, warn. A pill or tag is `--ds-pill-<hue>` text on a ~13%
  tint of the same hue.

## Type

- `font-family: var(--ds-font)`; code `var(--ds-font-mono)`.
- Numbers line up: `font-variant-numeric: tabular-nums` on every number.
- Sizes from the scale only: 11, 12, 13, 14, 15, 16, 22 px (`--ds-fs-2xs` to
  `--ds-fs-xl`). Body text is 14 (`--ds-fs-base`) in data-entry apps and 15
  (`--ds-fs-md`) on glanceable boards.
- Labels are **sentence case**. No `text-transform: uppercase`, no letter-spaced
  caps (the check fails on it).

## Shape and space

- Radius `--ds-radius` (10px) for cards, panels, buttons, inputs and nav items;
  `--ds-radius-sm` (6px) for chips inside a card; `--ds-radius-xs` (4px) for
  inline code and tiny marks; `--ds-radius-pill` for pills and badges; 50% for dots.
- Spacing on the 4px grid (`--ds-space-1` 4px to `--ds-space-8` 32px).
- **Cards have no outline**: they stand off the page by surface colour alone.
  Tables, inputs and secondary buttons keep a 1px `--ds-border`.

## Components

- **Top bar**: `--ds-surface` background, 1px `--ds-border` bottom edge, height
  `--ds-nav-height`. Brand on the left (16px, bold, `--ds-accent`, -0.3px
  tracking), then nav items as text buttons (`--ds-muted`, `--ds-text` on hover,
  the active one on a `--ds-card` background); docs link, version and theme
  toggle on the right.
- **Summary card**: `--ds-card`, `--ds-radius`, padding 16 to 20px; label
  (11 to 13px, `--ds-muted`, sentence case) over the value (22px bold,
  coloured only when the colour means something).
- **Buttons**: primary is `--ds-accent` fill with white text; secondary is
  transparent with a 1px `--ds-border`. Both `--ds-radius`, 13 to 14px text.
- **Pills and badges**: `--ds-radius-pill`, 11 to 12px, pill text on its tint.
- **Docs pages** (README viewers): same tokens as the app, sidebar of pages and
  headings on the left, content at most 840px wide.

## Behaviour

- Transitions `var(--ds-ease)`; respect `prefers-reduced-motion`.
- No new external assets (CDN scripts, web fonts): vendor what you need.
- Keyboard focus is always visible: a 2px `--ds-accent` outline.

## Changing the design language

Change it in Normolo/design-system (`plugins/design-language/`: `tokens.css`,
`DESIGN.md`), bump the version there, then in each app run
`/design-language:design-sync` (or `node design/sync.js --from <dir>`), and check
both apps in both themes.
