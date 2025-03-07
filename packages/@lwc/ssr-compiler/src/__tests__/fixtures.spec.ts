/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'node:path';
import { vi, describe } from 'vitest';
import { rollup } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { testFixtureDir, formatHTML, pluginVirtual } from '@lwc/test-utils-lwc-internals';
import { serverSideRenderComponent } from '@lwc/ssr-runtime';
import { DEFAULT_SSR_MODE, type CompilationMode } from '@lwc/shared';
import { expectedFailures } from './utils/expected-failures';
import type { LightningElementConstructor } from '@lwc/ssr-runtime';

interface FixtureConfig {
    /**
     * Component name that serves as the entrypoint / root component of the fixture.
     * @example x/test
     */
    entry: string;

    /** Props to provide to the top-level component. */
    props?: Record<string, string | string[]>;

    /** Output files used by ssr-compiler, when the output needs to differ fron engine-server */
    ssrFiles?: {
        error?: string;
        expected?: string;
    };

    /** The string used to uniquely identify one set of dedupe IDs with multiple SSR islands */
    styleDedupePrefix?: string;
}

vi.mock('@lwc/ssr-runtime', async () => {
    const runtime = await import('@lwc/ssr-runtime');
    try {
        runtime.setHooks({
            sanitizeHtmlContent(content: unknown) {
                return String(content);
            },
        });
    } catch (_err) {
        // Ignore error if the hook is already overridden
    }
    return runtime;
});

const SSR_MODE: CompilationMode = DEFAULT_SSR_MODE;

async function compileFixture({ entry, dirname }: { entry: string; dirname: string }) {
    const modulesDir = path.resolve(dirname, './modules');
    const outputFile = path.resolve(dirname, './dist/compiled-experimental-ssr.js');
    const input = 'virtual/fixture/test.js';

    const bundle = await rollup({
        input,
        external: ['lwc', '@lwc/ssr-runtime', 'vitest'],
        plugins: [
            pluginVirtual(`export { default } from "${entry}";`, input),
            lwcRollupPlugin({
                targetSSR: true,
                ssrMode: SSR_MODE,
                enableDynamicComponents: true,
                // TODO [#3331]: remove usage of lwc:dynamic in 246
                experimentalDynamicDirective: true,
                modules: [{ dir: modulesDir }],
                experimentalDynamicComponent: {
                    loader: path.join(__dirname, './utils/custom-loader.js'),
                    strictSpecifier: false,
                },
            }),
        ],
        onwarn({ message, code }) {
            if (code !== 'CIRCULAR_DEPENDENCY') {
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

describe.concurrent('fixtures', () => {
    testFixtureDir<FixtureConfig>(
        {
            root: path.resolve(__dirname, '../../../engine-server/src/__tests__/fixtures'),
            pattern: '**/config.json',
            ssrVersion: 2,
            // TODO [#4815]: enable all SSR v2 tests
            expectedFailures,
        },
        async ({ dirname, config }) => {
            const errorFile = config?.ssrFiles?.error ?? 'error.txt';
            const expectedFile = config?.ssrFiles?.expected ?? 'expected.html';

            let compiledFixturePath;
            try {
                compiledFixturePath = await compileFixture({
                    entry: config!.entry,
                    dirname,
                });
            } catch (err: any) {
                return {
                    [errorFile]: err.message,
                    [expectedFile]: '',
                };
            }

            const module: LightningElementConstructor = (await import(compiledFixturePath)).default;

            let result;
            let error;

            try {
                result = formatHTML(
                    await serverSideRenderComponent(
                        'fixture-test',
                        module,
                        config?.props ?? {},
                        config?.styleDedupePrefix ?? '',
                        true,
                        SSR_MODE
                    )
                );
            } catch (err: any) {
                error = err.message;
            }

            return {
                [errorFile]: error,
                [expectedFile]: result,
            };
        }
    );
});
