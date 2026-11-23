# Changelog

## v1.0.0

- First release. One palette for cashflow and homelab-dashboard, taken from
  cashflow's (which homelab-dashboard had already copied by hand), under one
  set of `--ds-*` names instead of two.
- Where the two apps disagreed:
  - **green**: homelab-dashboard's `#5fd88f`, the one green it settled on in
    v1.3.4 ("one green, board-wide"); cashflow's `#3ecf8e` is retired.
  - **radius**: 10px (homelab-dashboard) over 8px (cashflow).
  - **font stack**: homelab-dashboard's fuller system stack.
  - **top bar background**: cashflow's `#1a1d27` (`--ds-surface`).
    homelab-dashboard meant to copy it but used its card colour, because
    `--surface` meant "card" there and "chrome" in cashflow.
- Rules adopted from homelab-dashboard, which already enforced them: one green,
  sentence-case labels, borderless cards, tabular numerals, reduced motion.
- Type scale, radius scale and 4px spacing tokens.
- Status tints (`--ds-good-bg`, `--ds-warn-border`, ...) shared by both apps.
- Claude Code plugin `design-language`: the rules as a skill,
  `/design-language:design-sync`, `/design-language:design-review`, and an
  after-edit check.
