# Contribution opportunities (fork notes)

This fork tracks [salesforce/lwc](https://github.com/salesforce/lwc). Issues are tracked on the upstream repo (`has_issues` is disabled on the fork).

## What this codebase is

Monorepo for the Lightning Web Components **engine**, **compiler**, **SSR**, **synthetic shadow**, and integration/perf suites under `packages/@lwc/*` (for example `engine-core`, `engine-dom`, `template-compiler`, `ssr-compiler`, `synthetic-shadow`, `wire-service`).

## High-value contribution areas

| Area | Why it matters | Good starting points |
|------|----------------|----------------------|
| Docs / contributor onboarding | Reduces setup friction (especially Windows long paths, Volta, yarn) so more people can build and test | `CONTRIBUTING.md`, `ARCHITECTURE.md`, `README.md` |
| SSR (`ssr-compiler`, `ssr-runtime`, `engine-server`) | Active product surface; server rendering correctness affects Experience Cloud and SSR apps | Upstream SSR bugs/PRs; template return validation |
| Template / style compilers | Compile-time errors catch issues before runtime; nested `if:true` / `for:each` historically fragile | Compiler unit fixtures under `@lwc/template-compiler` |
| Accessibility + focus (synthetic shadow / WDIO) | Shadow DOM focus delegation is hard and user-visible | `@lwc/integration-wdio` accessibility suites |
| Tests for existing bugs | Maintainers ask for coverage when changing engine/compiler | Vitest fixtures + WTR integration tests |
| Perf / bundle size | LWC ships broadly on Salesforce; regressions hurt every Lightning page | `@lwc/perf-benchmarks`, `yarn bundlesize` |

## Upstream signals (as of exploration)

- Upstream has a large open issue/PR backlog (~400+).
- Long-lived help-wanted example: nested `if:true` + `for:each` DOM clearing ([salesforce/lwc#1028](https://github.com/salesforce/lwc/issues/1028)) — likely needs engine/compiler expertise and strong tests; not a first PR unless reproduced on current `master`.
- Prefer **docs**, **tests**, or **narrowly scoped fixes** with passing unit/integration tests over broad engine refactors (back-compat is strictly enforced — see contributing “Getting your changes reviewed”).

## Suggested first PR path for this fork

1. Land contributor-doc improvements here (this PR).
2. Open the same branch as a PR against `salesforce/lwc` when ready for upstream review.
3. Next: pick a small upstream bug with a failing fixture, or add tests around SSR / template edge cases.
