/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const fs = require('fs-extra');
const path = require('path');
const rollup = require('rollup');
const templates = require('../src/shared/templates.js');
const rollupLwcCompilerPlugin = require('@lwc/rollup-plugin');
const rollupCompatPlugin = require('rollup-plugin-compat');
const rollupReplacePlugin = require('rollup-plugin-replace');
const compatPolyfills = require('compat-polyfills');
const { getModulePath } = require('lwc');

// -- Build Config -------------------------------------------
const mode = process.env.MODE || 'compat';
const isCompat = /compat/.test(mode);
const isProd = /prod/.test(mode);

const engineModeFile = getModulePath(
    'engine',
    'iife',
    isCompat ? 'es5' : 'es2017',
    isProd ? 'prod' : 'dev'
);
const shadowModeFile = getModulePath(
    'synthetic-shadow',
    'iife',
    isCompat ? 'es5' : 'es2017',
    isProd ? 'prod' : 'dev'
);

const wireServicePath = getModulePath(
    'wire-service',
    'iife',
    isCompat ? 'es5' : 'es2017',
    isProd ? 'prod' : 'dev'
);
const todoPath = path.join(require.resolve('../src/shared/todo.js'));
const todoContent = fs.readFileSync(todoPath).toString();

const testSufix = '.test.js';
const testPrefix = 'test-';

const functionalTestDir = path.join(__dirname, '../', 'src/components');
const functionalTests = fs.readdirSync(functionalTestDir);

const testOutput = path.join(__dirname, '../', 'public');
const testSharedOutput = path.join(testOutput, 'shared');
const testEntries = functionalTests.reduce((seed, functionalFolder) => {
    const testsFolder = path.join(functionalTestDir, functionalFolder);
    const tests = fs.readdirSync(testsFolder).map(test => {
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

function testCaseComponentResolverPlugin() {
    return {
        name: 'test-case-resolver',
        resolveId(id) {
            if (/test\/case/.test(id)) {
                return path.resolve(`./src/shared/test-case.js`);
            }
        },
    };
}

function getTodoApp(testBundle) {
    return templates.todoApp(testBundle);
}

function entryPointResolverPlugin() {
    return {
        name: 'entry-point-resolver',
        resolveId(id) {
            if (id.includes(testSufix)) {
                return id;
            } else if (id === 'todo') {
                return 'todo.js';
            }
        },
        load(id) {
            if (id.includes(testSufix)) {
                const testBundle = getTestName(id);
                return testBundle.startsWith('wired-')
                    ? getTodoApp(testBundle)
                    : templates.app(testBundle);
            } else if (id === 'todo.js') {
                return todoContent;
            }
        },
    };
}

// -- Rollup config ---------------------------------------------

const globalModules = {
    'compat-polyfills/downgrade': 'window',
    'compat-polyfills/polyfills': 'window',
    lwc: 'LWC',
    'wire-service': 'WireService',
};

const baseInputConfig = {
    external: function(id) {
        return id in globalModules;
    },
    plugins: [
        entryPointResolverPlugin(),
        rollupLwcCompilerPlugin({
            exclude: `**/*${testSufix}`,
            resolveFromPackages: false,
        }),
        isCompat && rollupCompatPlugin({ polyfills: false }),
        isProd && rollupReplacePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }),
        testCaseComponentResolverPlugin(),
    ].filter(Boolean),
};

const baseOutputConfig = { format: 'iife', globals: globalModules };

// -- Build shared artifacts -----------------------------------------------------

if (!fs.existsSync(engineModeFile)) {
    throw new Error(
        'Compat version of engine not generated in expected location: ' +
            engineModeFile +
            '.\nGenerate artifacts from the top-level Lightning Web Components project first'
    );
}

// copy static files
fs.copySync(engineModeFile, path.join(testSharedOutput, 'engine.js'));
fs.copySync(shadowModeFile, path.join(testSharedOutput, 'shadow.js'));
fs.writeFileSync(path.join(testSharedOutput, 'downgrade.js'), compatPolyfills.loadDowngrade());
fs.writeFileSync(path.join(testSharedOutput, 'polyfills.js'), compatPolyfills.loadPolyfills());

fs.copySync(wireServicePath, path.join(testSharedOutput, 'wire.js'));
fs.copySync(todoPath, path.join(testSharedOutput, 'todo.js'));

// -- Build component tests -----------------------------------------------------=

testEntries
    .reduce(async (promise, test) => {
        await promise;
        const { name: testName, path: testEntry, namespace: testNamespace } = test;
        console.log(`Building integration test: ${testName}`);
        const bundle = await rollup.rollup({ ...baseInputConfig, input: testEntry });

        await bundle.write({
            ...baseOutputConfig,
            file: `${testOutput}/${testNamespace}/${testName}/${testName}.js`,
        });

        fs.writeFileSync(
            `${testOutput}/${testNamespace}/${testName}/index.html`,
            testName.startsWith('wired-')
                ? templates.wireServiceHtml(testName, isCompat)
                : templates.html(testName, isCompat),
            'utf8'
        );
    }, Promise.resolve())
    .catch(err => {
        console.log(err);
    });
