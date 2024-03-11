/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import fs from 'fs';
import path from 'path';
import * as glob from 'glob';
import MatcherUtils = jest.MatcherUtils;
import CustomMatcherResult = jest.CustomMatcherResult;
const { globSync } = glob;

/**
 * Jest matcher to assert that the content received matches the content in fixture file.
 * @param receivedContent the fixture content
 * @param filename the fixture absolute path
 * @returns matcher result
 * @example expect(content).toMatchFile(outputPath)
 */
function toMatchFile(
    this: MatcherUtils,
    receivedContent: string,
    filename: string
): CustomMatcherResult {
    const { snapshotState, expand, utils } = this;

    const fileExists = fs.existsSync(filename);

    if (fileExists) {
        const expectedContent = fs.readFileSync(filename, 'utf-8');

        if (receivedContent === null || receivedContent === undefined) {
            // If the file exists but the expected content is undefined or null. If the Jest is
            // running with the update snapshot flag the file should be deleted. Otherwise fails
            // the assertion stating that the file is not expected to be there.
            if (snapshotState._updateSnapshot === 'all') {
                fs.unlinkSync(filename);

                snapshotState.updated++;
                return { pass: true, message: () => '' };
            } else {
                snapshotState.unmatched++;
                return {
                    pass: false,
                    message: () =>
                        `Fixture output for "${filename}" exists but received no output for it. ` +
                        `The fixture has not been deleted. The update flag has to be explicitly ` +
                        `passed to write new fixture output.\n` +
                        `This is likely because this test is run in a continuous integration (CI) ` +
                        `environment in which fixtures are not written by default.\n\n` +
                        `Expected: ${utils.printExpected(expectedContent)}`,
                };
            }
        }

        if (expectedContent === receivedContent) {
            // If the expected file exists and the expected content is matching with the actual
            // content everything is fine.
            return { pass: true, message: () => '' };
        } else {
            // If the expected file is present but the content is not matching. if Jest is running
            // with the update snapshot flag override the expected content. Otherwise fails the
            // assertion with a diff.
            if (snapshotState._updateSnapshot === 'all') {
                fs.writeFileSync(filename, receivedContent);

                snapshotState.updated++;
                return { pass: true, message: () => '' };
            } else {
                snapshotState.unmatched++;
                return {
                    pass: false,
                    message: () => {
                        const diffString = utils.diff(expectedContent, receivedContent, {
                            expand,
                        });
                        return (
                            `Received content for "${filename}" doesn't match expected content.\n\n` +
                            (diffString && diffString.includes('- Expect')
                                ? `Difference:\n\n${diffString}`
                                : `Expected: ${utils.printExpected(expectedContent)}\n` +
                                  `Received: ${utils.printReceived(receivedContent)}`)
                        );
                    },
                };
            }
        }
    } else {
        if (receivedContent === null || receivedContent === undefined) {
            // If expected file doesn't exists and received content is null or undefined everything
            // is fine.
            return { pass: true, message: () => '' };
        }

        // If expected file doesn't exists but got a received content and if the snapshots
        // should be updated, create the new snapshot. Otherwise fails the assertion.
        if (snapshotState._updateSnapshot === 'new' || snapshotState._updateSnapshot === 'all') {
            fs.writeFileSync(filename, receivedContent);

            snapshotState.added++;
            return { pass: true, message: () => '' };
        } else {
            snapshotState.unmatched++;
            return {
                pass: false,
                message: () =>
                    `Fixture output for "${filename}" has not been written. The update flag has to` +
                    `be explicitly passed to write new fixture output.\n` +
                    `This is likely because this test is run in a continuous integration (CI) ` +
                    `environment in which fixtures are not written by default.\n\n` +
                    `Received: ${utils.printReceived(receivedContent)}`,
            };
        }
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Matchers<R> {
            __type: R; // unused, but makes TypeScript happy
            toMatchFile(receivedContent: string, filename?: string): CustomMatcherResult;
        }
    }
}

// Register jest matcher.
expect.extend({ toMatchFile });

type TestFixtureOutput = { [filename: string]: unknown };
type TestFixtureFileData = { filename: string; src: string; tester: jest.It };

const LwcTestDirectives = {
    Only: '/* LWC test only */',
    Skip: '/* LWC test skip */',
} as const;

/**
 * Parses fixtures for LWC test directives, which enable file-based tests to make use of jest's
 * `xit`/`test.skip` and `fit`/`test.only`.
 * @param filenames Test fixture filenames to parse for directives
 * @returns Parsed test fixture file data
 * @example // See usage below
 */
function getFilesToTest(filenames: string[]): TestFixtureFileData[] {
    // Matches comments at the start of a file
    const leadingComment = /^(\/\/.*?\n|\/\*[\s\S]*?\*\/)/;
    return filenames.map((filename) => {
        const src = fs.readFileSync(filename, 'utf-8');
        let remainingSrc = src.trim();
        let match = leadingComment.exec(remainingSrc);
        while (match) {
            const comment = match[0];
            switch (comment) {
                case LwcTestDirectives.Only: {
                    return {
                        filename,
                        // Strip the directive so we don't need to mess with the output file
                        src: src.replace(comment, ''),
                        tester: test.only,
                    };
                }
                case LwcTestDirectives.Skip: {
                    return {
                        filename,
                        // Strip the directive so we don't need to mess with the output file
                        src: src.replace(comment, ''),
                        tester: test.skip,
                    };
                }
                default: {
                    // Strip leading comment so we can check again
                    remainingSrc = remainingSrc.slice(comment.length).trim();
                    match = leadingComment.exec(remainingSrc);
                    break;
                }
            }
        }
        return { filename, src, tester: test };
    });
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

    const filesToTest = getFilesToTest(matches);

    for (const { filename, src, tester } of filesToTest) {
        const dirname = path.dirname(filename);
        const fixtureName = path.relative(root, filename);

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
