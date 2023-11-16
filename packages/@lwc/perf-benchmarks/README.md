# Benchmark

## Running the benchmarks

First, build the benchmarks:

```shell
yarn build:performance
```

Then run the benchmarks:

```shell
yarn test:performance
```

To run an individual benchmark, do:

```shell
cd packages/@lwc/perf-benchmarks
../../../node_modules/.bin/tach --config dist/__benchmarks__/path/to/tachometer.json
```

## Manual testing

When the benchmark is not working, the best way to debug it locally is to load its HTML file and inspect it in the Chrome DevTools. After building, you can run:

```shell
cd packages/@lwc/perf-benchmarks
../../../node_modules/.bin/tach --manual --config dist/__benchmarks__/path/to/tachometer.json
```

This will print out the URLs you can use to test manually.

When analyzing with the Chrome DevTools Performance tab, pay special attention to the following performance measures in the "Timing" section:

-   `benchmark-before`
-   `benchmark-run`
-   `benchmark-after`

`benchmark-run` is what's actually measured, whereas the `-before` and `-after` measures are just the setup and teardown code.

## Testing other branches

By default, the benchmark will compare the local code against the latest `master` branch from the `salesforce/lwc` repo. To test against another branch or commit, use the following environment variables when running `yarn build:performance`:

```shell
BENCHMARK_REPO=https://example.com/repo.git \
  BENCHMARK_REF=branchOrTagOrCommit \
  yarn build:performance
```

You can also use these environment variables to adjust the default benchmark settings:

```shell
BENCHMARK_SAMPLE_SIZE=50
BENCHMARK_AUTO_SAMPLE_CONDITIONS=25%
BENCHMARK_TIMEOUT=5
```

See the [Tachometer documentation](https://github.com/Polymer/tachometer) for details on what these mean.

You can run a smoke test (to confirm the benchmark tests are working) using:

```shell
BENCHMARK_SMOKE_TEST=1
```

If anything gets messed up when comparing to the other branch, add the `--force-clean-npm-install` flag when running `tach`.

Also note that, due to how NX does caching, any environment variables you pass to `build:performance` should also
be passed to `test:performance`. Otherwise, `test:performance` will use whatever environment variables you give it
(or don't give it) to re-run `build:performance`.

## Best benchmarks

This package also supports [Best](https://bestjs.dev) as a benchmark runner. To run the Best tests locally:

    yarn test:performance:best

Or for CI:

    yarn test:performance:best:ci
