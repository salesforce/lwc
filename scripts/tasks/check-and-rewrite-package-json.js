/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Checks that various package.json files are structured the way we expect.
// Errors if the files are different, and writes the changed files to disk.
//
// The goals are:
// 1. to avoid having to manually keep package.json files in sync with each other
// 2. to have a consistent format for all the package.jsons we publish to npm
//
// Use the flag `--test` if you want it to fail with a non-zero exit code if the package.json
// files differ from what we expect.

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

const IGNORED_PACKAGES = [
    'packages/@lwc/integration-karma',
    'packages/@lwc/integration-tests',
    'packages/@lwc/perf-benchmarks',
    'packages/@lwc/perf-benchmarks-components',
];

// This is the same list as in @lwc/rollup-plugin/src/index.ts
const LWC_EXPOSED_MODULES = {
    '@lwc/engine-dom': 'lwc',
    '@lwc/synthetic-shadow': '@lwc/synthetic-shadow',
    '@lwc/wire-service': '@lwc/wire-service',
};

const directories = globSync('./packages/@lwc/*').filter((_) => !IGNORED_PACKAGES.includes(_));

const expectedPkgJsons = [];

for (const dir of directories) {
    const filename = path.join('./', dir, 'package.json');
    const actual = fs.readFileSync(filename, 'utf-8');
    const pkg = JSON.parse(actual);

    const { name, description, version, dependencies, devDependencies, peerDependencies } = pkg;
    let { keywords } = pkg;

    // Keywords aren't really important, but keep any that already exist and add 'lwc'
    keywords = [...new Set((keywords || []).concat(['lwc']))].sort();

    const expectedJson = {
        name,
        version,
        description,
        keywords,
        homepage: 'https://lwc.dev',
        repository: {
            type: 'git',
            url: 'https://github.com/salesforce/lwc.git',
            directory: `packages/${name}`,
        },
        bugs: { url: 'https://github.com/salesforce/lwc/issues' },
        license: 'MIT',
        publishConfig: { access: 'public' },
        main: 'dist/index.cjs.js',
        module: 'dist/index.js',
        types: 'dist/index.d.ts',
        files: ['dist'],
        scripts: {
            build: 'rollup --config ../../../scripts/rollup/rollup.config.js',
            dev: 'rollup  --config ../../../scripts/rollup/rollup.config.js --watch --no-watch.clearScreen',
        },
        nx: {
            targets: {
                build: {
                    outputs: ['dist'],
                },
            },
        },
        dependencies,
        devDependencies,
        peerDependencies,
    };

    const exposedModule = LWC_EXPOSED_MODULES[name];
    if (exposedModule) {
        // Special case - consumers can do `import { LightningElement } from 'lwc'` and have it resolve to
        // `@lwc/engine-dom`. As for @lwc/synthetic-shadow and @lwc/wire-service, we have historically included these in
        // the "default modules" defined in @lwc/rollup-plugin.
        expectedJson.lwc = {
            modules: [
                {
                    name: exposedModule,
                    path: 'dist/index.js',
                },
            ],
            expose: [exposedModule],
        };
    }

    const expected = JSON.stringify(expectedJson, null, 4) + '\n';

    expectedPkgJsons.push({
        filename,
        expected,
        actual,
    });
}

// Check if any of the files are different than what we expect, so we can error in that case
const differingPackageJsonFiles = [];

for (const { filename, expected, actual } of expectedPkgJsons) {
    if (actual !== expected) {
        differingPackageJsonFiles.push(filename);
        fs.writeFileSync(filename, expected, 'utf-8');
    }
}

if (differingPackageJsonFiles.length > 0) {
    console.error(
        'Found package.json files with unexpected content. Content has been overwritten.\n' +
            'Please run `git commit` and `node ./scripts/tasks/check-and-rewrite-package-json.js` again.\n' +
            'Files:',
        differingPackageJsonFiles
    );
    // Only in "test" mode do we actually emit a non-zero exit code. This is designed for CI tests.
    // In other cases (e.g. as a git precommit hook), we can just exit with a normal 0 exit code.
    if (process.argv.includes('--test')) {
        process.exit(1);
    }
}
