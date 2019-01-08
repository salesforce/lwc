# integration-karma

Karma integration test for the `@lwc/compiler` and `@lwc/engine`.

## Getting started

### `yarn start`

Starts the Karma server in `watch` mode. Once the server is running you can navigate to http://localhost:9876 on you favorite browser to attach it to the test pool. Note that you can open different browsers to run the tests in parallel on all the browsers. While the server in running, updating a fixture will trigger the suite to run.

### `yarn test`

Run the test suite a single time on Google Chrome.

## Command line options

On top of the standard Karma [command line options](http://karma-runner.github.io/3.0/config/configuration-file.html), this package offers extra command line options:

* **`--compat`:** Compile and deliver tests in COMPAT mode.
* **`--native-shadow`:** Force the components to be created with native shadow enabled.
* **`--coverage`:** Gather engine code coverage, and store it in the `coverage` folder.
* **`--grep=<pattern>`:** Filter the spec to run based on the pattern.
