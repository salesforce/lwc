# @lwc/integration-karma

Karma integration test for `@lwc/compiler`, `@lwc/engine-dom`, and `@lwc/synthetic-shadow`.

## Getting started

### `yarn start`

Starts the Karma server in `watch` mode and start Google Chrome. Note that you can open different browsers to run the tests in parallel on all the browsers. While the server in running, updating a fixture will trigger the suite to run.

### `yarn hydration:start`

Starts the Karma server in `watch` mode and start Google Chrome, to run the hydration test suite. Note that you can open different browsers to run the tests in parallel on all the browsers. While the server in running, updating a fixture will trigger the suite to run.

### `yarn test`

Run the test suite a single time on Google Chrome.

### `yarn hydration:test`

Run the hydration test suite a single time on Google Chrome.

### `yarn coverage`

Combine the coverage produced by the different runs into a single coverage report.

Every time the test suite runs with the `COVERAGE=1` environment variable it produces a folder based on the run configuration and browser, in the `coverage/` folder. Running the `coverage` command merge all the coverages files in the into a single report in the `coverage/combined` folder.

## Test environment variables

This set of environment variables applies to the `start` and `test` commands:

-   **`LEGACY_BROWSERS=1`:** Run SauceLabs tests in legacy browsers.
-   **`DISABLE_SYNTHETIC=1`:** Run without any synthetic shadow polyfill patches.
-   **`FORCE_NATIVE_SHADOW_MODE_FOR_TEST=1`:** Force tests to run in native shadow mode with synthetic shadow polyfill patches.
-   **`ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL=1`:** ARIA string reflection as a global polyfill.
-   **`NODE_ENV_FOR_TEST`**: Set the `NODE_ENV` to be used for the tests (at runtime, in the browser).
-   **`COVERAGE=1`:** Gather engine code coverage, and store it in the `coverage` folder.
-   **`GREP="pattern"`:** Filter the spec to run based on the pattern.
-   **`API_VERSION=<version>`:** API version to use when compiling.
-   **`DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER=1`:** Disable synthetic shadow in the compiler itself.
-   **`DISABLE_STATIC_CONTENT_OPTIMIZATION=1`:** Disable static content optimization by setting `enableStaticContentOptimization` to `false`.

## Examples

```sh
DISABLE_SYNTHETIC=1 yarn test  # Run tests without any synthetic shadow polyfills
GREP=ShadowRoot yarn start     # Run "ShadowRoot" related tests in watch mode
COVERAGE=1 yarn test           # Compute coverage after a single test run
```

## Running Sauce Labs tests locally

To test Sauce Labs the same way we do in CI, run the following steps:

Start the Sauce Connect (`sc`) executable and wait for it to say that it's ready. (When you sign into SauceLabs, on the "Tunnel Proxies" page, there is a command you can copy-paste.)

In another console tab, start the tests using `yarn start`.

In another console tab, export the following env vars:

-   `SAUCE_USERNAME`
-   `SAUCE_KEY`
-   `SAUCE_TUNNEL_ID` – this is actually your tunnel _name_, not the ID. Copy it from the `sc` command you just ran.

Run:

```bash
npx karma start ./scripts/karma-configs/test/sauce.js --single-run
```

This will connect to Sauce Labs, start the browser, and run the tests.

You can also pass in `--log-level=debug` to `karma` for debug logging.

## Contributing

-   The test suite uses jasmine for test runner. You can find more details about jasmine here: https://jasmine.github.io/api/3.3/global
-   On top of the standard [jasmine matchers](https://jasmine.github.io/api/edge/matchers.html), the test suite also register custom matchers:
    -   `toLogErrorDev(message)`: `expect` a function to log an error with a specific message in DEV only.
    -   `toThrowErrorDev(Error, message)`: `expect` a function to throw an error with a specific Error constructor and a specific message.
-   Some of the test command options are available in the test suite on the global `process.env` object:
    -   `process.env.DISABLE_SYNTHETIC`: is set to `false` by default and `true` if the
        `DISABLE_SYNTHETIC` environment variable is set.
    -   `FORCE_NATIVE_SHADOW_MODE_FOR_TEST`: is set to `false` by default and `true` if the
        `FORCE_NATIVE_SHADOW_MODE_FOR_TEST` environment variable is set.
-   The test setup file (`test-setup.js`) will automatically clean up the DOM before and after each test. So you don't have to do anything to clean up. However, you should use `beforeEach()` rather than `beforeAll()` to add DOM elements for your test, so that the cleanup code can properly clean up the DOM.
