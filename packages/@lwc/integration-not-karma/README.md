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

Hydration tests test the SSR packages, and are therefore more complex than the integration tests. While the files are named `index.spec.js`, they are actually _config_ files. The actual test executed is defined in `test-hydration.js`. The hydration tests are transformed by a plugin defined in `serve-hydration.js`.

Each hydration test is expected to define an entrypoint component named `x/main`. Each test config is expected to adhere to this interface:

```ts
interface HydrationTestConfig<Snapshot extends any> {
    /** Props to provide for the root `x/main` component. */
    props?: Record<string, string>;
    /** Client-side props to hydrate the root `x/main` component. */
    clientProps?: Record<string, string>;
    /** List of feature flags that should be enabled for the test. */
    requiredFeatureFlags?: string[];
    /**
     * A function that can be used to capture the pre-hydration state of the page.
     * Only executed if `test` is defined.
     * @returns Any data that is needed for assertions in the `test` function.
     */
    snapshot?(
        /** The root element being rendered. */
        xMain: HTMLElement
    ): Snapshot;
    /**
     * A function that contains assertions, run after hydration. Should be used if
     * asserting the pre-hydration state is not required.
     */
    test?(
        /** The root element being rendered. */
        target: HTMLElement,
        /** Whatever data was returned by the `snapshot` function. */
        snapshot: Snapshot | undefined,
        /** Console calls during hydration. */
        calls: Record<'log' | 'warn' | 'error', unknown[][]>
    ): void | Promise<void>;
    /**
     * A function that contains assertions and is also responsible for hydrating the page.
     * Should only be used if assertions are required before hydration.
     */
    advancedTest?(
        /** The test root element being rendered. */
        target: HTMLElement,
        /** Various utils for test assertions. */
        utils: {
            /** The class constructor for the root component. */
            Component: LightningElement;
            /** A bound instance of LWC's `hydrateComponent` function. Must be called within `advancedTest`. */
            hydrateComponent: typeof LWC.hydrateComponent;
            /** Tracks console calls. */
            consoleSpy: {
                /** Console calls during hydration. */
                calls: Record<'log' | 'warn' | 'error', unknown[][]>;
                /** Resets the tracked console calls. */
                reset(): void;
            };
            /** The parent of the root element. */
            container: HTMLDivElement;
            /** The selector for root element.  */
            selector: 'x-main';
        }
    ): void | Promise<void>;
}
```

## Design Goals

1. Web Test Runner is an ESM-first test runner, which means that as much code as possible should be served directly to the browser. LWC components must be transformed, so some bundling is unavoidable, but should be minimized.
2. "Magic" should be avoided as much as possible -- global variables, code defined in strings, etc. When unavoidable, the source of the magic should be explained in comments.
3. Simplify code wherever possible. These tests were originally written many years ago, for a different testing framework (Karma). There are many workarounds or sub-optimal patterns used to accommodate Karma or older browsers, because new developers were unfamiliar with established patterns, and so on. When updating tests, we should try to update the code to remove legacy logic.
4. Over-use code comments. There are a lot of systems in play, and it's not always apparent why code was written in a particular way.
