# Raptor Benchmarking

## Bundles

A *bundle* is a static snapshot of the framework with the benchmarking tests. By default the generated bundles are located in the `dist` directory. On the file system, a bundle is a directory containing 2 files:
* `bundle.js`: raptor framework + associated benchmarking tests
* `info.json`: metadata related to the bundle

> **Note:** For each commit, the CI job generates a new bundle and publish it to the [raptor/benchmark-artifacts repo](https://git.soma.salesforce.com/raptor/benchmark-artifacts).

```bash
yarn run build
```

**Options**:

* **`name`**: Set the name of the bundle. (default: `[current git hash hash]`)

## Runner

The *runner* is a standale javascript application. It receives as input one or multiple bundles, run the bundles in isolation, report and compoare the benchmark results. You can start the runner by directly accesing the app via a browser or using the runner cli.

### Runner app

You can run the following commands to build and start the bundle app. The app is then accessible at [http://localhost:8000/](http://localhost:8000/).

```bash
yarn run build-runner
yarn run serve
```

**Options**:

The runner can be configured either from the form, or by passing the parameter as query string in the url.

* **Base URL**: URL of the base bundle. (required: `true`, url param: `base`)
* **Compare URL**: URL of the bundle to compare against the `base` bundle. (url param: `compare`)
* **Filter**: Instead of running all the test, the runner will only run the tests matching the pattern (url param: `grep`)
* **Maximum benchmark duration**: The upper-bound duration a benchmark should run in ms. (url param: `maxDuration`)
* **Minimum benchmark sample**: The lower-bound number of iteration a benchmark should run. (url param: `minSampleCount`)

### Runner CLI

It's also possible to run the benchmark comparison from the command line. The CLI takes care of spawning a new browser, load the benchmark application with the parameters and retrieve the benchmark results.

```bash
yarn run cli
```

**Options**:

* **`server`**: URL of the runner application (default: `https://localhost:8000/index.html`)
* **`browser`**: Name of the browser to start. (values: [`chrome`, `firefox`], default: `chrome`)
* **`reporter`**: Type of output (values: [`pretty`, `json`, `markdown`], default: `pretty`)
* **`dest`**: File path where the output will the saved.
* + all the options that can be passed to the runner application.

**Examples**:

```bash
# Run the benchmark for the bundle named HEAD served from the dist directory.
yarn run start -- --base=/HEAD

# Run a quick benchmark for sanity check.
yarn run start -- --base=/HEAD --max-duration=1 --min-sample-count=2

# Compare 2 bundles from the central bundle repository and store the results as markdown
yarn run start -- \
    --base=https://git.soma.salesforce.com/pages/raptor/benchmark-artifacts/2b29efe \
    --compare=https://git.soma.salesforce.com/pages/raptor/benchmark-artifacts/530706c \
    --reporter=markdown \
    --dest=./results.md
```
