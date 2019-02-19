# integration-karma

Karma integration test for the `@lwc/compiler` and `@lwc/engine`.

## Getting started

### `yarn start`

Starts the Karma server in `watch` mode and start Google Chrome. Note that you can open different browsers to run the tests in parallel on all the browsers. While the server in running, updating a fixture will trigger the suite to run.

### `yarn test`

Run the test suite a single time on Google Chrome.

### `yarn coverage`

Combine the coverage produced by the different runs into a single coverage report.

Every time the test suite runs with the `--coverage` flag it produces a folder based on the run configuration and browser, in the `coverage/` folder. Running the `coverage` command merge all the coverages files in the into a single report in the `coverage/combined` folder.

## Test command options

This set of options applies to the `start` and `test` commands. On top of the standard Karma [command line options](http://karma-runner.github.io/3.0/config/configuration-file.html), this package offers extra command line options:

-   **`--compat`:** Compile and deliver tests in COMPAT mode.
-   **`--native-shadow`:** Force the components to be created with native shadow enabled.
-   **`--coverage`:** Gather engine code coverage, and store it in the `coverage` folder.
-   **`--grep=<pattern>`:** Filter the spec to run based on the pattern.

## Contributing

-   The test suite uses jasmine for test runner. You can find more details about jasmine here: https://jasmine.github.io/api/3.3/global
-   You should rather import `createElement` from `test-utils` instead of `lwc`. The `createElement` element from `test-utils` set `fallback` to false if the `--native-shadow` flag is passed to the command.
