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

### Integration Tests

Integration tests are simply `.spec.js` files that run in the browser. LWC components are transformed by a plugin defined in `serve-integration.js`.

### Hydration Tests

Hydration tests test the SSR packages, and are therefore more complex than the integration tests. While the files are named `index.spec.js`, they are actually _config_ files. The actual test executed is defined in `test-hydration.js`, which also contains the interface definition for the config. Each hydration test is also expected to define an entrypoint component named `x/main`. The hydration tests are transformed by a plugin defined in `serve-hydration.js`.

## Design Goals

1. Web Test Runner is an ESM-first test runner, which means that as much code as possible should be served directly to the browser. LWC components must be transformed, so some bundling is unavoidable, but should be minimized.
2. "Magic" should be avoided as much as possible -- global variables, code defined in strings, etc. When unavoidable, the source of the magic should be explained in comments.
3. Simplify code wherever possible. These tests were originally written many years ago, for a different testing framework (Karma). There are many workarounds or sub-optimal patterns used to accommodate Karma or older browsers, because new developers were unfamiliar with established patterns, and so on. When updating tests, we should try to update the code to remove legacy logic.
4. Over-use code comments. There are a lot of systems in play, and it's not always apparent why code was written in a particular way.
