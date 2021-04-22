# integration-karma

Karma integration test for `@lwc/compiler`, `@lwc/engine-dom`, and `@lwc/synthetic-shadow`.

## Getting started

### `yarn start`

Starts the Karma server in `watch` mode and start Google Chrome. Note that you can open different browsers to run the tests in parallel on all the browsers. While the server in running, updating a fixture will trigger the suite to run.

### `yarn test`

Run the test suite a single time on Google Chrome.

### `yarn coverage`

Combine the coverage produced by the different runs into a single coverage report.

Every time the test suite runs with the `COVERAGE=1` environment variable it produces a folder based on the run configuration and browser, in the `coverage/` folder. Running the `coverage` command merge all the coverages files in the into a single report in the `coverage/combined` folder.

## Test environment variables

This set of environment variables applies to the `start` and `test` commands:

-   **`COMPAT=1`:** Compile and deliver tests in COMPAT mode.
-   **`NATIVE_SHADOW=1`:** Force the components to be created with native shadow enabled.
-   **`COVERAGE=1`:** Gather engine code coverage, and store it in the `coverage` folder.
-   **`GREP="pattern"`:** Filter the spec to run based on the pattern.

## Examples

```sh
NATIVE_SHADOW=1 GREP=ShadowRoot yarn start          # Run in watch mode the "ShadowRoot" related tests with native shadow enable
COVERAGE=1 yarn test                                # Run all the test once and compute coverage
```

## Contributing

-   The test suite uses jasmine for test runner. You can find more details about jasmine here: https://jasmine.github.io/api/3.3/global
-   On top of the standard [jasmine matchers](https://jasmine.github.io/api/edge/matchers.html), the test suite also register custom matchers:
    -   `toLogErrorDev(message)`: `expect` a function to log an error with a specific message in DEV only.
    -   `toThrowErrorDev(Error, message)`: `expect` a function to throw an error with a specific Error constructor and a specific message.
-   You should rather import `createElement` from `test-utils` instead of `lwc`. The `createElement` element from `test-utils` set `fallback` to false if the `--native-shadow` flag is passed to the command.
-   Some of the test command options are available in the test suite on the global `process.env` object:
    -   `process.env.COMPAT`: is set to `false` by default and `true` if the `--compat` flag is passed
    -   `process.env.NATIVE_SHADOW`: is set to `false` by default and `true` if the `--native-shadow` flag is passed
-   The test setup file (`test-setup.js`) will automatically clean up the DOM before and after each test. So you don't have to do anything to clean up. However, you should use `beforeEach()` rather than `beforeAll()` to add DOM elements for your test, so that the cleanup code can properly clean up the DOM.
