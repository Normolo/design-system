---
name: design-sync
description: Bring this app up to the design-system release shipped in this plugin, or adopt the shared design language in an app that doesn't have it yet.
disable-model-invocation: true
---

# Sync this app with the design system

The release in this plugin lives in `${CLAUDE_SKILL_DIR}/../..`: `tokens.css`,
`DESIGN.md` and `sync.js`. Its version is in the first line of each.

## The app already has `design/sync.js`

1. Compare versions: `head -1 design/tokens.css` against
   `head -1 "${CLAUDE_SKILL_DIR}/../../tokens.css"`. Same version: say so and stop.
2. `node design/sync.js --from "${CLAUDE_SKILL_DIR}/../.."` copies the three
   files in and rewrites every token block.
3. `node design/sync.js --check`. Fix what it reports. A token that was renamed
   or removed in the release breaks aliases: update the alias block, not the
   token block.
4. Run the app's tests, then follow the app's CLAUDE.md for versioning,
   changelog and how changes are delivered (branch, PR or main).
5. Summarise which tokens changed value and what that looks like on screen.

## The app has no `design/` folder (adoption)

1. Find every file that carries the app's CSS (`<style>` in HTML, CSS inside
   server-side templates). Each one becomes a target.
2. `mkdir design` and copy `tokens.css`, `DESIGN.md`, `sync.js` into it.
3. Write `design/design.json`:
   `{ "targets": { "<path from repo root>": { "maxRawColours": 0 } } }`.
4. At the top of each target's `<style>`, put the two marker lines from
   `sync.js` (`node design/sync.js` prints them if they're missing), then run
   `node design/sync.js`.
5. Replace the app's own colour variables with aliases of `--ds-*` tokens
   (`--line: var(--ds-border)`), keeping the old names so nothing else changes.
   Where the app's value differs from the token, the token wins; note each one.
   Delete the app's own light-theme overrides for anything now aliased.
6. `node design/sync.js --count`, put each number into `maxRawColours`, then
   `--check` must pass. Lower the counts later as hard-coded colours move to tokens.
7. Add a test that runs `node design/sync.js --check` in the app's test runner.
8. Add to the app's CLAUDE.md:

   ```
   ## Design language
   UI follows the shared design language in @design/DESIGN.md. Never edit the
   design-system token block or design/tokens.css, design/DESIGN.md, design/sync.js
   by hand; `node design/sync.js --check` must pass.
   ```

9. Add the marketplace to the app's `.claude/settings.json`:

   ```json
   {
     "extraKnownMarketplaces": {
       "normolo": { "source": { "source": "github", "repo": "Normolo/design-system" } }
     },
     "enabledPlugins": { "design-language@normolo": true }
   }
   ```

10. Render the app in both themes and compare with an app already on the system.
