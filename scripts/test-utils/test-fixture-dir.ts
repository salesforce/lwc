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

async function exists(filepath: string) {
    try {
        await fs.promises.access(filepath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Facilitates the use of vitest's `test.only`/`test.skip` in fixture files.
 * @param dirname fixture directory to check for "directive" files
 * @returns `{ only: true }` if `.only` exists, `{ skip: true }` if `.skip` exists, otherwise `{}`
 * @throws if you have both `.only` and `.skip` in the directory
 * @example getTestOptions('/fixtures/some-test')
 */
async function getTestOptions(dirname: string) {
    const [only, skip] = await Promise.all(
        ['.only', '.skip'].map((f) => exists(path.join(dirname, f)))
    );
    if (only && skip) {
        const relpath = path.relative(process.cwd(), dirname);
        throw new Error(`Cannot have both .only and .skip in ${relpath}`);
    }
    return { only, skip };
}

export interface TestFixtureConfig extends StyleCompilerConfig {
    /** Component name. */
    name?: string;
    /** Component namespace. */
    namespace?: string;
    /** Props to provide to the top-level component. */
    props?: Record<string, string | string[]>;
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

type SnapshotFile = `${string}.${'json' | 'txt' | 'html' | 'js'}`;
type Snapshots<R> = Record<
    SnapshotFile,
    (result: R) => string | undefined | Promise<string | undefined>
>;
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
export function testFixtureDir<R, T extends unknown[]>(
    config: {
        pattern: string | string[];
        root: string;
        ignore?: string | string[];
    },
    testFn: (
        options: {
            filename: string;
            dirname: string;
            config?: TestFixtureConfig;
        },
        ...context: T
    ) => R | Promise<R>
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
        ignore: config.ignore,
    });

    return async (
        {
            expectedFailures = {},
            ...snapshots
        }: Snapshots<R> & {
            expectedFailures?: Record<string, string[] | Record<string, string>>;
        },
        ...context: T
    ) => {
        const formatters = Object.entries(snapshots);
        for (const filename of matches) {
            const dirname = path.dirname(filename);
            const relpath = path.relative(root, filename);
            const overrides = expectedFailures[relpath] ?? [];
            const options = await getTestOptions(dirname);

            describe.concurrent(relpath, options, () => {
                let result: R;

                beforeAll(async () => {
                    result = await testFn(
                        {
                            filename,
                            dirname,
                            config: await getFixtureConfig(dirname),
                        },
                        ...context
                    );
                });

                for (const [outputName, f] of formatters) {
                    const fails = Array.isArray(overrides) && overrides.includes(outputName);
                    const name = Array.isArray(overrides) ? outputName : overrides[outputName];
                    const outputPath = path.join(dirname, name);
                    test.concurrent(name, { fails }, async ({ expect }) => {
                        const content = await f(result);
                        try {
                            if (content === undefined) {
                                await expect(exists(outputPath)).resolves.toBe(false);
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
    };
}
