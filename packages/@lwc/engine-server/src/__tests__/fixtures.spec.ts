/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'node:path';
import { vi, describe, beforeAll, afterAll } from 'vitest';
import { rollup } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { testFixtureDir, formatHTML, pluginVirtual } from '@lwc/test-utils-lwc-internals';
import { renderComponent, setFeatureFlagForTest } from '../index';
import type { LightningElementConstructor } from '@lwc/engine-core/dist/framework/base-lightning-element';
import type { RollupLwcOptions } from '@lwc/rollup-plugin';
import type { FeatureFlagName, FeatureFlagValue } from '@lwc/features/dist/types';

vi.mock('lwc', async () => {
    const lwcEngineServer = await import('../index');
    try {
        lwcEngineServer.setHooks({ sanitizeHtmlContent: String });
    } catch (_err) {
        // Ignore error if the hook is already overridden
    }
    return lwcEngineServer;
});

/**
 * `setFeatureFlagForTest` is intentionally a no-op in production mode. We do not want to expose a
 * utility that lets end users hijack feature flags in production, but we still need to do it
 * ourselves in production mode tests, so this helper lives here.
 */
function setFeatureFlagForProductionTest(name: FeatureFlagName, value: FeatureFlagValue): void {
    const original = process.env.NODE_ENV;
    if (original === 'production') {
        process.env.NODE_ENV = 'development';
    }
    setFeatureFlagForTest(name, value);
    if (original === 'production') {
        process.env.NODE_ENV = original;
    }
}

interface FixtureConfig {
    /**
     * Component name that serves as the entrypoint / root component of the fixture.
     * @example x/test
     */
    entry: string;

    /** Props to provide to the root component. */
    props?: Record<string, string>;

    /** Feature flags to enable for the test. */
    features: FeatureFlagName[];
}

async function compileFixture({
    entry,
    dirname,
    options,
}: {
    entry: string;
    dirname: string;
    options?: RollupLwcOptions;
}) {
    const optionsAsString =
        Object.entries(options ?? {})
            .map(([key, value]) => `${key}=${value}`)
            .join('-') || 'default';
    const modulesDir = path.resolve(dirname, './modules');
    const outputFile = path.resolve(dirname, `./dist/compiled-${optionsAsString}.js`);
    const input = 'virtual/fixture/test.js';

    const bundle = await rollup({
        input,
        external: ['lwc', '@lwc/ssr-runtime', 'vitest'],
        plugins: [
            pluginVirtual(`export { default } from "${entry}";`, input),
            lwcRollupPlugin({
                enableDynamicComponents: true,
                enableLwcOn: true,
                experimentalDynamicComponent: {
                    loader: path.join(import.meta.dirname, './utils/custom-loader.js'),
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
                code === 'CIRCULAR_DEPENDENCY' ||
                // TODO [#5010]: template-compiler -> index -> validateElement generates UNKNOWN_HTML_TAG_IN_TEMPLATE for MathML elements
                message.includes('LWC1123');
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
    testFixtureDir<FixtureConfig>(
        {
            root: path.resolve(import.meta.dirname, '../../../ssr-compiler/src/__tests__/fixtures'),
            ssrVersion: 1,
            pattern: '**/config.json',
        },
        async ({ dirname, config }) => {
            let compiledFixturePath;

            try {
                compiledFixturePath = await compileFixture({
                    entry: config!.entry,
                    dirname,
                    options,
                });
            } catch (err: any) {
                // Filter out the stacktrace, just include the LWC error message
                const message = err?.message?.match(/(LWC\d+[^\n]+)/)?.[1] ?? err.message;
                return {
                    'expected.html': '',
                    'error.txt': message,
                };
            }

            let result;
            let err;
            try {
                config?.features?.forEach((flag) => {
                    setFeatureFlagForProductionTest(flag, true);
                });

                const module: LightningElementConstructor = (await import(compiledFixturePath))
                    .default;

                result = formatHTML(renderComponent('fixture-test', module, config?.props ?? {}));
            } catch (_err: any) {
                if (_err?.name === 'AssertionError') {
                    throw _err;
                }
                err = _err?.message || 'An empty error occurred?!';
            }

            config?.features?.forEach((flag) => {
                setFeatureFlagForProductionTest(flag, false);
            });

            return {
                'expected.html': result,
                'error.txt': err,
            };
        }
    );
}

describe.concurrent('fixtures', () => {
    beforeAll(() => {
        // ENABLE_WIRE_SYNC_EMIT is used because this mimics the behavior for LWR in SSR mode. It's also more reasonable
        // for how both `engine-server` and `ssr-runtime` behave, which is to use sync rendering.
        setFeatureFlagForProductionTest('ENABLE_WIRE_SYNC_EMIT', true);
    });

    afterAll(() => {
        setFeatureFlagForProductionTest('ENABLE_WIRE_SYNC_EMIT', false);
    });

    describe.concurrent('default', () => {
        testFixtures();
    });

    // Test with and without the static content optimization to ensure the fixtures are the same
    describe.concurrent('enableStaticContentOptimization=false', () => {
        testFixtures({ enableStaticContentOptimization: false });
    });
});
