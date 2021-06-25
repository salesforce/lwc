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
cd packages/perf-benchmarks
../../node_modules/.bin/tach --config dist/__benchmarks__/path/to/tachometer.json
```

## Manual testing

When the benchmark is not working, the best way to debug it locally is to load its HTML file and inspect it in the Chrome DevTools. After building, you can run:

```shell
cd packages/perf-benchmarks
../../node_modules/.bin/tach --manual --config dist/__benchmarks__/path/to/tachometer.json
```

This will print out the URLs you can use to test manually.

When analyzing with the Chrome DevTools Performance tab, pay special attention to the following performance measures in the "Timing" section:

-   `benchmark-before`
-   `benchmark-run`
-   `benchmark-after`

`benchmark-run` is what's actually measured, whereas the `-before` and `-after` measures are just the setup and teardown code.

## Modifying the benchmark components locally

If you're adding new benchmarks with new benchmark components and you want to test those against the tip-of-tree branch, then add this to your `.bashrc` to ensure that the tip-of-tree is overwritten with your local components:

```shell
export CIRCLE_WORKING_DIRECTORY=/path/to/lwc
```

## Testing other branches

By default, the benchmark will compare the local code against the latest `master` branch from the `salesforce/lwc` repo. To test against another branch or commit, change `ref` and/or `repo` in `perf-benchmarks/scripts/build.js` and then re-run
`yarn build:performance`.

If anything gets messed up when comparing to the other branch, add the `--force-clean-npm-install` flag when running `tach`.
