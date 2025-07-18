/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Builds the HTML and tachometer.json files necessary to run the benchmarks.
 */

const path = require('node:path');
const { readFile, writeFile } = require('node:fs/promises');
const { readFileSync } = require('node:fs');
const { glob } = require('glob');
const { hashElement } = require('folder-hash');

const {
    BENCHMARK_SMOKE_TEST,
    BENCHMARK_REPO = 'https://github.com/salesforce/lwc.git',
    BENCHMARK_REF = 'master',
    BENCHMARK_AUTO_SAMPLE_CONDITIONS = '1%', // how much difference we want to determine between A and B
    CHROME_BINARY, // if a custom chrome binary is used eg: in CI
} = process.env;
let {
    BENCHMARK_SAMPLE_SIZE = 100, // minimum number of samples to run
    BENCHMARK_TIMEOUT = 15, // timeout in minutes during auto-sampling (after the minimum samples). If 0, no auto-sampling
    BENCHMARK_CPU_THROTTLING_RATE, // CPU throttling factor, typically 2 or 4
} = process.env;

const toInt = (num) => (typeof num === 'number' ? num : parseInt(num, 10));

// 2 is the minimum sample size allowed by Tachometer
BENCHMARK_SAMPLE_SIZE = BENCHMARK_SMOKE_TEST ? 2 : toInt(BENCHMARK_SAMPLE_SIZE);
// Timeout of 0 means don't auto-sample at all
BENCHMARK_TIMEOUT = BENCHMARK_SMOKE_TEST ? 0 : toInt(BENCHMARK_TIMEOUT);
BENCHMARK_CPU_THROTTLING_RATE =
    BENCHMARK_CPU_THROTTLING_RATE && toInt(BENCHMARK_CPU_THROTTLING_RATE);

const benchmarkComponentsDir = path.join(__dirname, '../../../@lwc/perf-benchmarks-components');
const packageRootDir = path.resolve(__dirname, '..');
const packageJson = JSON.parse(readFileSync(path.resolve(packageRootDir, 'package.json'), 'utf-8'));

// lwc packages that need to be swapped in when comparing the current code to the latest tip-of-tree code.
const swappablePackages = Object.keys(packageJson.dependencies).filter((_) =>
    _.startsWith('@lwc/')
);

function createHtml(benchmarkFile) {
    return `
    <!doctype html>
    <html>
      <head>
        <title>Benchmark</title>
      </head>
      <body>
        <script type="module">
          // Always test performance in production mode.
          // Note this is needed for modules like @lwc/synthetic-shadow, since we can't run it through
          // @rollup/plugin-replace since Tachometer will serve it.
          window.process = { env: { NODE_ENV: 'production' } };
        </script>
        <script type="module" src="./${path.basename(benchmarkFile)}"></script>
      </body>
    </html>
  `.trim();
}

function createTachometerJson(htmlFilename, benchmarkName, directoryHash, cpuThrottlingRate) {
    return {
        $schema: 'https://raw.githubusercontent.com/Polymer/tachometer/master/config.schema.json',
        sampleSize: BENCHMARK_SAMPLE_SIZE,
        autoSampleConditions: [BENCHMARK_AUTO_SAMPLE_CONDITIONS],
        timeout: BENCHMARK_TIMEOUT,
        // The root must be whatever dir contains your `node_modules`, so that Tachometer can resolve bare npm imports
        // See: https://github.com/google/tachometer/issues/244#issuecomment-2267191898
        root: path.relative(path.dirname(htmlFilename), packageRootDir),
        benchmarks: [
            {
                url: htmlFilename,
                name: benchmarkName,
                browser: {
                    name: 'chrome',
                    headless: true,
                    ...(CHROME_BINARY && { binary: CHROME_BINARY }),
                    ...(typeof cpuThrottlingRate === 'number' && { cpuThrottlingRate }),
                },
                measurement: {
                    mode: 'performance',
                    entryName: 'benchmark-run',
                },
                expand: [
                    {
                        name: `${benchmarkName}-this-change`,
                    },
                    // In the smoke test, don't bother pulling in a comparison branch and testing it
                    !BENCHMARK_SMOKE_TEST && {
                        name: `${benchmarkName}-tip-of-tree`,
                        packageVersions: {
                            label: 'tip-of-tree',
                            dependencies: Object.fromEntries(
                                swappablePackages.map((pkg) => [
                                    pkg,
                                    {
                                        kind: 'git',
                                        repo: BENCHMARK_REPO,
                                        ref: BENCHMARK_REF,
                                        subdir: `packages/${pkg}`,
                                        setupCommands: [
                                            // Replace the `@lwc/perf-benchmarks-components` from the tip-of-tree
                                            // with ours, just in case we've modified them locally.
                                            // We want to recompile whatever benchmarks we've added with the
                                            // compiler code from tip-of-tree, but we also want Tachometer to serve
                                            // `@lwc/perf-benchmarks-components` itself.
                                            'rm -fr ./packages/@lwc/perf-benchmarks-components/src',
                                            'rm -fr ./packages/@lwc/perf-benchmarks-components/scripts',
                                            `cp -R ${benchmarkComponentsDir}/src ./packages/@lwc/perf-benchmarks-components`,
                                            `cp -R ${benchmarkComponentsDir}/scripts ./packages/@lwc/perf-benchmarks-components`,
                                            'yarn --frozen-lockfile',
                                            // bust the Tachometer cache in case these files change locally
                                            `echo '${directoryHash}'`,
                                            'yarn build:performance:components',
                                        ],
                                    },
                                ])
                            ),
                        },
                    },
                ].filter(Boolean),
            },
        ],
    };
}

// Given a *.benchmark.js file, extract the exported `cpuThrottlingRate`.
async function extractCpuThrottlingRate(benchmarkFile) {
    const contents = await readFile(benchmarkFile, 'utf-8');
    // Rollup transforms this into `const cpuThrottlingRate = 2; [...] export { cpuThrottlingRate };`,
    // so we just look for the const, not the export.
    // We could do a more sophisticated thing than a regex, but the regex works fine.
    const match = contents.match(/const cpuThrottlingRate\s*=\s*(\d+)/);
    return match && parseInt(match[1], 10);
}

// Given a benchmark source file, create the necessary HTML file and Tachometer JSON
// file for running it.
async function processBenchmarkFile(benchmarkFile, directoryHash) {
    const targetDir = path.dirname(benchmarkFile);
    const benchmarkFileBasename = path.basename(benchmarkFile);
    const htmlFilename = path.join(targetDir, benchmarkFileBasename.replace('.js', '.html'));

    // Generate a pretty name for the benchmark to display in Tachometer results
    const splitFileName = benchmarkFile.split(path.sep);
    const engineType = splitFileName[splitFileName.indexOf('__benchmarks__') + 1];
    const benchmarkName = `${engineType}-${benchmarkFileBasename.split('.')[0]}`;

    async function writeHtmlFile() {
        const html = createHtml(benchmarkFile);
        await writeFile(htmlFilename, html, 'utf8');
    }

    async function writeTachometerJsonFile() {
        const cpuThrottlingRate =
            typeof BENCHMARK_CPU_THROTTLING_RATE === 'number'
                ? BENCHMARK_CPU_THROTTLING_RATE
                : await extractCpuThrottlingRate(benchmarkFile);
        const tachometerJson = createTachometerJson(
            htmlFilename,
            benchmarkName,
            directoryHash,
            cpuThrottlingRate
        );
        const jsonFilename = path.join(
            targetDir,
            `${benchmarkFileBasename.split('.')[0]}.tachometer.json`
        );
        await writeFile(jsonFilename, JSON.stringify(tachometerJson, null, 2), 'utf8');
    }

    await Promise.all([writeHtmlFile(), writeTachometerJsonFile()]);
}

async function main() {
    const { hash: directoryHash } = await hashElement(path.join(benchmarkComponentsDir, 'dist'), {
        algo: 'sha256',
    });

    const benchmarkFiles = await glob(
        path.join(__dirname, '../dist/__benchmarks__/**/*.benchmark.js')
    );

    await Promise.all(benchmarkFiles.map((file) => processBenchmarkFile(file, directoryHash)));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
