# Benchmark

## Remote runner

If you want to run the benchmark directly from your local machine into the heroku farm, you can execute the following command:

```bash
yarn build
cd packages/benchmark
yarn remote
```

Note: this is currently skipping the IE11 runner.

## Manual Testing

When the benchmark is not working, the best way to debug it locally is by executing the following command:

```bash
yarn build
cd packages/benchmark
yarn start -- src/__benchmarks__/benchmark-table-component/tablecmp-append-1k.benchmark.js --projects best.headless.config.js
```

That will build and execute the test for the benchmark specified in the path after `--`. At the same time, it will display the local path information, e.g.:

```bash
Temporary benchmark artifact:
/var/folders/83/9rs0gwkx1qx0j6z3m8cjfrks0d7341/T/best_hzj62p/lwc-engine-benchmark/tablecmp-append-1k.benchmark/tablecmp-append-1k.benchmark.html
```

If you open that file in your local browser, you should be able to debug the test. Don't forget to open the console and execute the following command to kick off the Best Running in the browser:

```js
BEST.runBenchmark({ iterations: 1 });
```
