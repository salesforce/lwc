/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'node:path';
import { vi, describe, beforeEach, afterEach } from 'vitest';
import { rollup } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { testFixtureDir, formatHTML } from '@lwc/test-utils-lwc-internals';
import { setFeatureFlagForTest } from '../index';
import type { RollupLwcOptions } from '@lwc/rollup-plugin';
import type * as lwc from '../index';

interface FixtureModule {
    tagName: string;
    default: typeof lwc.LightningElement;
    props?: { [key: string]: any };
    features?: any[];
}

vi.setConfig({ testTimeout: 10_000 /* 10 seconds */ });

vi.mock('lwc', async () => {
    const lwcEngineServer = await import('../index');
    try {
        lwcEngineServer.setHooks({
            sanitizeHtmlContent(content: unknown) {
                return content as string;
            },
        });
    } catch (_err) {
        // Ignore error if the hook is already overridden
    }
    return lwcEngineServer;
});

async function compileFixture({
    input,
    dirname,
    options,
}: {
    input: string;
    dirname: string;
    options?: RollupLwcOptions;
}) {
    const optionsAsString =
        Object.entries(options ?? {})
            .map(([key, value]) => `${key}=${value}`)
            .join('-') || 'default';
    const modulesDir = path.resolve(dirname, './modules');
    const outputFile = path.resolve(dirname, `./dist/compiled-${optionsAsString}.js`);

    const bundle = await rollup({
        input,
        external: ['lwc', 'vitest'],
        plugins: [
            lwcRollupPlugin({
                enableDynamicComponents: true,
                experimentalDynamicComponent: {
                    loader: path.join(__dirname, './utils/custom-loader.js'),
                    strictSpecifier: false,
                },
                modules: [
                    {
                        dir: modulesDir,
                    },
                ],
                ...options,
            }),
        ],
        onwarn({ message, code }) {
            // TODO [#3331]: The existing lwc:dynamic fixture test will generate warnings that can be safely suppressed.
            const shouldIgnoreWarning =
                message.includes('LWC1187') ||
                // TODO [#4497]: stop warning on duplicate slots or disallow them entirely (LWC1137 is duplicate slots)
                message.includes('LWC1137') ||
                // IGNORED_SLOT_ATTRIBUTE_IN_CHILD is fine; it is used in some of these tests
                message.includes('LWC1201') ||
                message.includes('-h-t-m-l') ||
                code === 'CIRCULAR_DEPENDENCY';
            if (!shouldIgnoreWarning) {
                throw new Error(message);
            }
        },
    });

    await bundle.write({
        file: outputFile,
        format: 'esm',
        exports: 'named',
    });

    return outputFile;
}

function testFixtures(options?: RollupLwcOptions) {
    testFixtureDir(
        {
            root: path.resolve(__dirname, 'fixtures'),
            pattern: '**/index.js',
        },
        async ({ filename, dirname, config }) => {
            let compiledFixturePath;

            try {
                compiledFixturePath = await compileFixture({
                    input: filename,
                    dirname,
                    options,
                });
            } catch (err: any) {
                // Filter out the stacktrace, just include the LWC error message
                const message = err?.message?.match(/(LWC\d+[^\n]+)/)?.[1];
                return {
                    'expected.html': '',
                    'error.txt': message,
                };
            }

            // The LWC engine holds global state like the current VM index, which has an impact on
            // the generated HTML IDs. So the engine has to be re-evaluated between tests.
            // On top of this, the engine also checks if the component constructor is an instance of
            // the LightningElement. Therefor the compiled module should also be evaluated in the
            // same sandbox registry as the engine.
            const lwcEngineServer = await import('../index');
            const module = (await import(compiledFixturePath)) as FixtureModule;

            const features = module!.features ?? [];
            features.forEach((flag) => {
                lwcEngineServer!.setFeatureFlagForTest(flag, true);
            });

            let result;
            let err;
            try {
                result = formatHTML(
                    lwcEngineServer!.renderComponent(
                        module!.tagName,
                        module!.default,
                        config?.props ?? {}
                    )
                );
            } catch (_err: any) {
                if (_err.name === 'AssertionError') {
                    throw _err;
                }
                err = _err.message;
            }

            features.forEach((flag) => {
                lwcEngineServer!.setFeatureFlagForTest(flag, false);
            });

            return {
                'expected.html': result,
                'error.txt': err,
            };
        }
    );
}

describe.concurrent('fixtures', () => {
    beforeEach(() => {
        // ENABLE_WIRE_SYNC_EMIT is used because this mimics the behavior for LWR in SSR mode. It's also more reasonable
        // for how both `engine-server` and `ssr-runtime` behave, which is to use sync rendering.
        setFeatureFlagForTest('ENABLE_WIRE_SYNC_EMIT', true);
    });

    afterEach(() => {
        setFeatureFlagForTest('ENABLE_WIRE_SYNC_EMIT', false);
    });

    describe.concurrent('default', () => {
        testFixtures();
    });

    // Test with and without the static content optimization to ensure the fixtures are the same
    describe.concurrent('enableStaticContentOptimization=false', () => {
        testFixtures({ enableStaticContentOptimization: false });
    });
});
