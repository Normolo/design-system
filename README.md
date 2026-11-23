# design-system

One design language for Normolo's apps, currently **cashflow** and
**homelab-dashboard**. This repo is also a Claude Code plugin marketplace, so
Claude in either app knows the rules, can pull in a new release, and gets
told immediately when an edit breaks them.

## What's here

| Path | What it is |
|---|---|
| `plugins/design-language/tokens.css` | **The source of truth**: every colour, type size, radius and spacing value, dark and light, as `--ds-*` custom properties |
| `plugins/design-language/DESIGN.md` | The rules: what each colour means, type, shape, components, behaviour |
| `plugins/design-language/sync.js` | The script each app keeps in `design/`: copies the tokens into its pages and checks nothing drifted |
| `plugins/design-language/skills/` | Claude Code skills: `design-language` (loads by itself for UI work), `/design-language:design-sync`, `/design-language:design-review` |
| `plugins/design-language/hooks/` | After every file edit Claude makes in an app, runs that app's `design/sync.js --check` and shows Claude any problem |
| `.claude-plugin/marketplace.json` | Makes this repo a marketplace named `normolo` |
| `tests/` | `node --test`: versions agree, every token has a light value, one green, contrast floors |

## How an app uses it

Each app has a `design/` folder with copies of `tokens.css`, `DESIGN.md` and
`sync.js`, plus its own `design.json` listing the files that carry CSS. Every
one of those files has the token block pasted between two marker lines at the
top of its `<style>`. No build step and no extra request: the apps stay
single-file.

The app's own CSS variables are aliases of the tokens
(`--hair: var(--ds-border)`), so older code keeps working while every value
comes from here.

The app's tests run `node design/sync.js --check`, which fails if:

- a token block was edited by hand, or doesn't match `design/tokens.css`;
- the copies in `design/` come from different releases;
- a file has more raw colours (`#hex`, `rgb()`) than its allowance in
  `design.json` (the allowance only goes down);
- anything uses `text-transform: uppercase`.

Each app's `CLAUDE.md` imports `design/DESIGN.md`, so the rules are in every
Claude session (including web sessions where plugins aren't installed). Its
`.claude/settings.json` registers this marketplace and turns the plugin on.

## Changing the design

1. Edit `plugins/design-language/tokens.css` and/or `DESIGN.md`.
2. Bump the version in all four places: the first line of `tokens.css`,
   `DESIGN.md` and `sync.js` (plus its `VERSION`), and `plugin.json`. Add a
   `CHANGELOG.md` entry. `node --test` checks they agree.
3. Push. Claude Code picks the new plugin version up on its next marketplace
   update (`/plugin marketplace update normolo`, or turn on auto-update for
   `normolo` under `/plugin` → Marketplaces).
4. In each app, run `/design-language:design-sync`, review both themes, ship
   it the way that app ships things.

## Setting it up on a machine

Opening either app in Claude Code and trusting the folder registers the
marketplace from the app's `.claude/settings.json`. To add it by hand:

```
/plugin marketplace add Normolo/design-system
/plugin install design-language@normolo
```

If the repo is ever made private, git on each machine then needs read access
to it (for example `gh auth login` then `gh auth setup-git`).

## A third app

Open it in Claude Code with the plugin installed and run
`/design-language:design-sync`. With no `design/` folder it walks through
adoption: targets, markers, aliases, allowances, test, CLAUDE.md and settings.
