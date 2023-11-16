/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('node:path');
const fs = require('node:fs');
const rollup = require('rollup');
const rollupLwcCompilerPlugin = require('@lwc/rollup-plugin');
const rollupReplacePlugin = require('@rollup/plugin-replace');

const templates = require('../src/shared/templates.js');

// -- Build Config -------------------------------------------
const mode = process.env.MODE || 'dev';
const isProd = /prod/.test(mode);

const engineModeFile = require.resolve('@lwc/engine-dom/dist/index.js');
const shadowModeFile = require.resolve('@lwc/synthetic-shadow/dist/index.js');

const testSufix = '.test.js';
const testPrefix = 'test-';

const functionalTestDir = path.join(__dirname, '../', 'src/components');
const functionalTests = fs.readdirSync(functionalTestDir);

const testOutput = path.join(__dirname, '../', 'public');
const testSharedOutput = path.join(testOutput, 'shared');
const testEntries = functionalTests.reduce((seed, functionalFolder) => {
    const testsFolder = path.join(functionalTestDir, functionalFolder);
    const tests = fs.readdirSync(testsFolder).map((test) => {
        const testPath = path.join(testsFolder, test, `${test}${testSufix}`);
        return { path: testPath, namespace: functionalFolder, name: getTestName(testPath) };
    });
    return seed.concat(tests);
}, []);

// -- Plugins & Helpers -------------------------------------

function getTestName(absPpath) {
    return path
        .basename(absPpath.replace(testPrefix, '').replace(testSufix, '.js'), '.js')
        .replace(testPrefix, '');
}

function entryPointResolverPlugin() {
    return {
        name: 'entry-point-resolver',
        resolveId(id) {
            if (id.includes(testSufix)) {
                return id;
            }
        },
        load(id) {
            if (id.includes(testSufix)) {
                const testBundle = getTestName(id);
                return templates.app(testBundle);
            }
        },
    };
}

// -- Rollup config ---------------------------------------------

const globalModules = {
    lwc: 'LWC',
};

function createRollupInputConfig() {
    return {
        external: function (id) {
            return id in globalModules;
        },
        plugins: [
            entryPointResolverPlugin(),
            rollupLwcCompilerPlugin({ exclude: `**/*${testSufix}` }),
            isProd &&
                rollupReplacePlugin({
                    'process.env.NODE_ENV': JSON.stringify('production'),
                    preventAssignment: true,
                }),
        ].filter(Boolean),
    };
}

const baseOutputConfig = { format: 'iife', globals: globalModules };

// -- Build shared artifacts -----------------------------------------------------

// copy static files
fs.mkdirSync(testSharedOutput, { recursive: true });
fs.copyFileSync(engineModeFile, path.join(testSharedOutput, 'engine.js'));
fs.copyFileSync(shadowModeFile, path.join(testSharedOutput, 'shadow.js'));

// -- Build component tests -----------------------------------------------------=

async function main() {
    for (const test of testEntries) {
        const { name: testName, path: testEntry, namespace: testNamespace } = test;
        console.log(`Building integration test: ${testName} | ${testEntry}`);
        const bundle = await rollup.rollup({ ...createRollupInputConfig(), input: testEntry });

        await bundle.write({
            ...baseOutputConfig,
            file: `${testOutput}/${testNamespace}/${testName}/${testName}.js`,
        });

        fs.writeFileSync(
            `${testOutput}/${testNamespace}/${testName}/index.html`,
            templates.html(testName),
            'utf8'
        );
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
