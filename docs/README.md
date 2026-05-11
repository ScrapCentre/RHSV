# ScrapCentre.com — Project Documentation

Documentation that ships with the `feat/v1-product-spec` PR for Novalytix.

## Where to start

| If you're… | Read |
|---|---|
| Reviewing this PR | [HANDOVER.md](HANDOVER.md) — the demo script, what's mocked, how to run, suggested review order |
| Trying to understand what we're building | [PRODUCT-SPEC.md](PRODUCT-SPEC.md) — the live product spec (✅ LOCKED / 💡 PROPOSED / ❓ PENDING tags throughout) |
| Picking up engineering work | [ENGINEERING-DESIGN.md](ENGINEERING-DESIGN.md) — data model, API surface, mock-adapter pattern, state machine, file change list |
| Working on UI / pages | [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) — color tokens, components, screen-by-screen wireframes, microcopy library |
| Writing customer-facing copy or assets | [BRAND-GUIDE.md](BRAND-GUIDE.md) — brand colors, logo, voice, contact info |
| Tracing why a particular file changed | [wave-reports/](wave-reports/) — per-agent reports for the three implementation waves |

## How this PR was built

The branch is the output of a **multi-agent build process** the founder ran via Claude Code. Sub-agents played distinct roles (Software Architect, UI/UX Designer, Backend Dev, Frontend Dev, Full-stack Dev, QA Engineer); their per-wave reports are in `wave-reports/`. Each agent worked on a disjoint scope of files, then PM committed the work in clean per-wave commits.

The branch contains **4 commits** (3 feature + 1 QA); they can be reviewed, cherry-picked, squashed, or rebased per Novalytix's preference. None of them touch production (`scrapcentre.com`) — the dummy is for staging at `scrapcentre.online` only.
