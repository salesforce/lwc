/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTestFactory = require('./utils/test-transform').pluginTest;
const testFunction = require('../index');
const pluginNoop = pluginTestFactory(testFunction);
const pluginTestStrict = pluginTestFactory(testFunction, {
    dynamicImports: { loader: null, strictSpecifier: true },
});
const pluginTestLoader = pluginTestFactory(testFunction, {
    dynamicImports: { loader: '@custom/loader', strictSpecifier: true },
});

describe('Dynamic imports', () => {
    pluginNoop(
        'passthough with no config',
        `
        export async function test() {
            const id = "foo";
            const x = await import(id);
            return x + "yay";
        }
    `,
        {
            output: {
                code: `
        export async function test() {
            const id = "foo";
            const x = await import(id);
            return x + "yay";
        }
    `,
            },
        }
    );

    pluginTestStrict(
        'check validation for strict',
        `
        export async function test() {
            const id = "foo";
            const x = await import(id);
            return x + "yay";
        }
    `,
        {
            error: {
                message:
                    'Invalid import. The argument "id" must be a stringLiteral for dynamic imports when strict mode is enabled.',
                loc: {
                    line: 3,
                    column: 23,
                    length: 2,
                    start: 72,
                },
            },
        }
    );

    pluginTestStrict(
        'unchanged dynamic import in strict mode',
        `
        export async function test() {
            const x = await import("foo");
            return x + "yay";
        }
    `,
        {
            output: {
                code: `
        export async function test() {
            const x = await import("foo");
            return x + "yay";
        }
        `,
            },
        }
    );

    pluginTestLoader(
        'test custom loader',
        `
        export async function test() {
            const x = await import("foo");
            return x + "yay";
        }
    `,
        {
            output: {
                code: `
                import { load as _load } from "@custom/loader";
                export async function test() {
                    const x = await _load("foo");
                    return x + "yay";
                }
                `,
            },
        }
    );

    pluginTestLoader(
        'test custom loader multiple imports',
        `
        export async function test() {
            const x = await import("foo");
            const y = await import("bar");
            return x + y + "yay";
        }
    `,
        {
            output: {
                code: `
                import { load as _load } from "@custom/loader";
                export async function test() {
                    const x = await _load("foo");
                    const y = await _load("bar");
                    return x + y + "yay";
                }
                `,
            },
        }
    );
});
