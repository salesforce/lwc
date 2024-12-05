/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import fs, { readFileSync } from 'node:fs';
import path from 'node:path';
import { AssertionError } from 'node:assert';
import { test } from 'vitest';
import * as glob from 'glob';
import type { Config as StyleCompilerConfig } from '@lwc/style-compiler';
const { globSync } = glob;

type TestFixtureOutput = { [filename: string]: unknown };

function existsUp(dir: string, file: string): boolean {
    while (true) {
        if (fs.existsSync(path.join(dir, file))) return true;
        dir = path.join(dir, '..');
        const basename = path.basename(dir);
        // We should always hit __tests__, but check for system root as an escape hatch
        if (basename === '__tests__' || basename === '') return false;
    }
}

/**
 * Facilitates the use of vitest's `test.only`/`test.skip` in fixture files.
 * @param dirname fixture directory to check for "directive" files
 * @returns `{ only: true }` if `.only` exists, `{ skip: true }` if `.skip` exists, otherwise `{}`
 * @throws if you have both `.only` and `.skip` in the directory
 * @example getTestOptions('/fixtures/some-test')
 */
function getTestOptions(dirname: string) {
    const isOnly = existsUp(dirname, '.only');
    const isSkip = existsUp(dirname, '.skip');
    if (isOnly && isSkip) {
        const relpath = path.relative(process.cwd(), dirname);
        throw new Error(`Cannot have both .only and .skip in ${relpath}`);
    }
    return isOnly ? { only: true } : isSkip ? { skip: true } : {};
}

export interface TestFixtureConfig extends StyleCompilerConfig {
    /** Component name. */
    name?: string;
    /** Component namespace. */
    namespace?: string;
    /** Props to provide to the top-level component. */
    props?: Record<string, string | string[]>;
    /** Output files used by ssr-compiler, when the output needs to differ fron engine-server */
    ssrFiles?: {
        error?: string;
        expected?: string;
    };
}

/** Loads the the contents of the `config.json` in the provided directory, if present. */
function getFixtureConfig<T extends TestFixtureConfig>(dirname: string): T | undefined {
    const filepath = path.join(dirname, 'config.json');
    let contents: string;
    try {
        contents = fs.readFileSync(filepath, 'utf8');
    } catch (err) {
        if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
            return undefined;
        }
        throw err;
    }
    return JSON.parse(contents);
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
 * @param config.expectedFailures Any tests that you expect to fail
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
export function testFixtureDir<T extends TestFixtureConfig>(
    config: {
        pattern: string;
        root: string;
        expectedFailures?: Set<string>;
    },
    testFn: (options: {
        src: string;
        filename: string;
        dirname: string;
        config?: T;
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
        const fixtureConfig = getFixtureConfig<T>(dirname);
        const relpath = path.relative(root, filename);
        const options = getTestOptions(dirname);
        const fails = config.expectedFailures?.has(relpath);

        test(relpath, { fails, ...options }, async ({ expect }) => {
            const outputs = await testFn({
                src,
                filename,
                dirname,
                config: fixtureConfig,
            });

            if (typeof outputs !== 'object' || outputs === null) {
                throw new TypeError(
                    'Expected test function to returns a object with fixtures outputs'
                );
            }

            const outputsList = Object.entries(outputs);

            for (const [outputName, content] of outputsList) {
                const outputPath = path.resolve(dirname, outputName);
                try {
                    await expect(content ?? '').toMatchFileSnapshot(outputPath);
                } catch (err) {
                    if (typeof err === 'object' && err !== null) {
                        // Hide unhelpful noise in the stack trace
                        // https://v8.dev/docs/stack-trace-api#stack-trace-collection-for-custom-exceptions
                        Error.captureStackTrace(err, testFixtureDir);
                    }

                    const isErrorSnapshot = outputName.startsWith('error');
                    const isSuccessSnapshot = outputName.startsWith('expected');

                    // If we change from a successful result to an error (or vice versa),
                    // then either the snapshot or content for the failing file is empty,
                    // and the diff printed in the error message isn't helpful. Here, we check for
                    // that case, and then check if the other file has flipped the other way.
                    // If it has, we throw a more helpful error message.
                    if (isErrorSnapshot || isSuccessSnapshot) {
                        const brokenResult = outputs[outputName];
                        const brokenResultHasContent = Boolean(brokenResult);
                        const brokenSnapshot = readFileSync(outputPath, 'utf8');
                        const brokenSnapshotHasContent = Boolean(brokenSnapshot);
                        if (brokenResultHasContent !== brokenSnapshotHasContent) {
                            // This file flipped from content to empty, or vice versa
                            const otherType = isErrorSnapshot ? 'expected' : 'error';
                            const otherName = outputsList.find(([name]) =>
                                name.startsWith(otherType)
                            )![0];
                            const otherResult = outputs[otherName];
                            const otherResultHasContent = Boolean(otherResult);
                            const otherSnapshot = readFileSync(
                                path.resolve(dirname, otherName),
                                'utf8'
                            );
                            const otherSnapshotHasContent = Boolean(otherSnapshot);
                            if (otherResultHasContent !== otherSnapshotHasContent) {
                                // The other file has flipped from content to empty, or vice versa
                                const expectedContentName = brokenSnapshotHasContent
                                    ? outputName
                                    : otherName;
                                const actualContentName = brokenResultHasContent
                                    ? outputName
                                    : otherName;
                                const contentErr = new AssertionError({
                                    message: `Expected ${relpath} to have content in ${expectedContentName}, but found content in ${actualContentName}.`,
                                    expected: brokenSnapshotHasContent
                                        ? brokenSnapshot
                                        : otherSnapshot,
                                    actual: brokenResultHasContent ? brokenResult : otherResult,
                                });
                                Error.captureStackTrace(contentErr, testFixtureDir);
                                throw contentErr;
                            }
                        }
                    }

                    throw err;
                }
            }
        });
    }
}
