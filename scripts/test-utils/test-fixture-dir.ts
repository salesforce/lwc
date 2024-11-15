/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, test } from 'vitest';
import * as glob from 'glob';
import type { Config as StyleCompilerConfig } from '@lwc/style-compiler';
const { globSync } = glob;

/**
 * Facilitates the use of vitest's `test.only`/`test.skip` in fixture files.
 * @param dirname fixture directory to check for "directive" files
 * @returns `{ only: true }` if `.only` exists, `{ skip: true }` if `.skip` exists, otherwise `{}`
 * @throws if you have both `.only` and `.skip` in the directory
 * @example getTestOptions('/fixtures/some-test')
 */
function getTestOptions(dirname: string) {
    const isOnly = fs.existsSync(path.join(dirname, '.only'));
    const isSkip = fs.existsSync(path.join(dirname, '.skip'));
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
async function getFixtureConfig<T extends TestFixtureConfig>(
    dirname: string
): Promise<T | undefined> {
    const filepath = path.join(dirname, 'config.json');
    let contents: string;
    try {
        contents = await fs.promises.readFile(filepath, 'utf8');
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
export function testFixtureDir<R>(
    config: {
        pattern: string;
        root: string;
        expectedFailures?: Set<string>;
    },
    testFn: (options: {
        filename: string;
        dirname: string;
        config?: TestFixtureConfig;
    }) => R | Promise<R>,
    formatters: Record<string, (result: R) => string | undefined | Promise<string | undefined>>
) {
    if (typeof config !== 'object' || config === null) {
        throw new TypeError(`Expected first argument to be an object`);
    }

    if (typeof testFn !== 'function') {
        throw new TypeError(`Expected second argument to be a function`);
    }

    const { pattern, root } = config;
    if (!pattern || !root || !formatters) {
        throw new TypeError(`Expected a "root" and a "pattern" config to be specified`);
    }

    const matches = globSync(pattern, {
        cwd: root,
        absolute: true,
    });

    const _formatters = Object.entries(formatters);

    for (const filename of matches) {
        const dirname = path.dirname(filename);

        const relpath = path.relative(root, filename);
        const options = getTestOptions(dirname);
        const fails = config.expectedFailures?.has(relpath);
        describe(relpath, { fails, ...options }, () => {
            let result: R;

            beforeAll(async () => {
                result = await testFn({
                    filename,
                    dirname,
                    config: await getFixtureConfig(dirname),
                });
            });

            for (const [outputName, f] of _formatters) {
                test.concurrent(outputName, async ({ expect }) => {
                    const outputPath = path.resolve(dirname, outputName);
                    const content = await f(result);
                    try {
                        if (content === undefined) {
                            expect(fs.existsSync(outputPath)).toBe(false);
                        } else {
                            await expect(content).toMatchFileSnapshot(outputPath);
                        }
                    } catch (err) {
                        if (typeof err === 'object' && err !== null) {
                            // Hide unhelpful noise in the stack trace
                            // https://v8.dev/docs/stack-trace-api#stack-trace-collection-for-custom-exceptions
                            Error.captureStackTrace(err, testFixtureDir);
                        }

                        throw err;
                    }
                });
            }
        });
    }
}
