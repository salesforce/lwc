# LWC [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/) integration tests

## Quick Start

To run integration tests, run `yarn test:wtr` from the monorepo root, or `yarn test` from the package directory.

To run hydration tests, run `yarn test:hydration` from either the monorepo root or the package directory.

To manually debug tests in your browser, add the `--manual` flag to the test command.

To run individual test files, provide them as CLI arguments. If using relative paths, they must be relative to the _package directory_, e.g. `yarn test:wtr test/act/index.spec.js`.

Environment variables are used as controls to run tests in different modes (e.g native vs synthetic shadow, different API versions). The full list of controls is defined in [`helpers/options.js`](./helpers/options.js).

## Architecture

- `configs`: WTR configuration files. The main entrypoints are `integration.js` and `hydration.js`.
- `helpers`: Helper functions used by tests and the test runner.
- `mocks`: Module mocks to replace imports in tests.
- `test`: The test directory for integration tests.
- `test-hydration`: The test directory for hydration tests.

### Test Runners

By default, the tests are run using Playwright. If the `USE_SAUCE` env var is set, then SauceLabs is used instead. To use SauceLabs, the `SAUCE_USERNAME`, `SAUCE_ACCESS_KEY`, and `SAUCE_TUNNEL_ID` env vars must be set.

### Integration Tests

Integration tests are simply `.spec.js` files that run in the browser. LWC components are transformed by a plugin defined in `serve-integration.js`.

## Custom Compiler Config

To specify custom compiler config on a per test or per component basis, use a custom comment directive, `/* !WTR { ... } */`. This can be applied for an entire test directory by including it in the `.spec.js` file, or on a per-file basis by including it in individual files. Note that individual configs must be included per _file_, not per _component_. You must include the directive in _every_ JS/CSS/HTML file that needs to use a different config. HTML files should use HTML comments, e.g. `<!-- !WTR { "apiVersion": 60 } -->`.

### Hydration Tests

Hydration tests test the SSR packages, and are therefore more complex than the integration tests. While the files are named `index.spec.js`, they are actually _config_ files. The actual test executed is defined in `test-hydration.js`, which also contains the interface definition for the config. Each hydration test is also expected to define an entrypoint component named `x/main`. The hydration tests are transformed by a plugin defined in `serve-hydration.js`.

## Design Goals

1. Web Test Runner is an ESM-first test runner, which means that as much code as possible should be served directly to the browser. LWC components must be transformed, so some bundling is unavoidable, but should be minimized.
2. "Magic" should be avoided as much as possible -- global variables, code defined in strings, etc. When unavoidable, the source of the magic should be explained in comments.
3. Simplify code wherever possible. These tests were originally written many years ago, for a different testing framework (Karma). There are many workarounds or sub-optimal patterns used to accommodate Karma or older browsers, because new developers were unfamiliar with established patterns, and so on. When updating tests, we should try to update the code to remove legacy logic.
4. Over-use code comments. There are a lot of systems in play, and it's not always apparent why code was written in a particular way.
