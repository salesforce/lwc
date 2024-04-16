/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import fs from 'fs';
import path from 'path';
import * as glob from 'glob';
const { globSync } = glob;

type TestFixtureOutput = { [filename: string]: unknown };

/**
 * Facilitates the use of jest's `test.only`/`test.skip` in fixture files.
 * @param dirname fixture directory to check for "directive" files
 * @returns `test.only` if `.only` exists, `test.skip` if `.skip` exists, otherwise `test`
 * @throws if you have both `.only` and `.skip` in the directory
 * @example getTestFunc('/fixtures/some-test')
 */
function getTestFunc(dirname: string): jest.It {
    const isOnly = fs.existsSync(path.join(dirname, '.only'));
    const isSkip = fs.existsSync(path.join(dirname, '.skip'));
    if (isOnly && isSkip) {
        const relpath = path.relative(process.cwd(), dirname);
        throw new Error(`Cannot have both .only and .skip in ${relpath}`);
    }
    return isOnly ? test.only : isSkip ? test.skip : test;
}

/**
 * Test a fixture directory against a set of snapshot files. This method generates a test for each
 * file matching the `config.pattern` glob. The `testFn` fixture is invoked for each test and is
 * expected to return an object representing the fixture outputs. The key represents the output
 * file name and the value, its associated content. An `undefined` or `null` value represents a
 * non existing file.
 * @param config The config object
 * @param config.pattern The glob pattern to locate each individual fixture.
 * @param config.root The directory from where the pattern is executed.
 * @param testFn The test function executed for each fixture.
 * @throws On invalid input or output
 * @example
 * testFixtureDir(
 *   { root: 'fixtures', pattern: '**\/actual.js' },
 *   ({src}) => {
 *     let result, error
 *     try { result = transform(src) } catch (e) { error = e }
 *     return { 'expected.js': result, 'error.txt': error }
 *   }
 * )
 */
export function testFixtureDir(
    config: { pattern: string; root: string },
    testFn: (options: {
        src: string;
        filename: string;
        dirname: string;
    }) => TestFixtureOutput | Promise<TestFixtureOutput>
) {
    if (typeof config !== 'object' || config === null) {
        throw new TypeError(`Expected first argument to be an object`);
    }

    if (typeof testFn !== 'function') {
        throw new TypeError(`Expected second argument to be a function`);
    }

    const { pattern, root } = config;
    if (!pattern || !root) {
        throw new TypeError(`Expected a "root" and a "pattern" config to be specified`);
    }

    const matches = globSync(pattern, {
        cwd: root,
        absolute: true,
    });

    for (const filename of matches) {
        const src = fs.readFileSync(filename, 'utf-8');
        const dirname = path.dirname(filename);
        const fixtureName = path.relative(root, filename);
        const tester = getTestFunc(dirname);

        tester(fixtureName, async () => {
            const outputs = await testFn({
                src,
                filename,
                dirname,
            });

            if (typeof outputs !== 'object' || outputs === null) {
                throw new TypeError(
                    'Expected test function to returns a object with fixtures outputs'
                );
            }

            for (const [outputName, content] of Object.entries(outputs)) {
                const outputPath = path.resolve(dirname, outputName);
                expect(content).toMatchFile(outputPath);
            }
        });
    }
}
