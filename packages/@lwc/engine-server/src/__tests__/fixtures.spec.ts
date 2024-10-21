/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';

import { rollup } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { vi } from 'vitest';
import { testFixtureDir, formatHTML } from '@lwc/test-utils-lwc-internals';
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
    lwcEngineServer!.setHooks({
        sanitizeHtmlContent(content: unknown) {
            return content as string;
        },
    });
    return lwcEngineServer;
});

async function compileFixture({ input, dirname }: { input: string; dirname: string }) {
    const modulesDir = path.resolve(dirname, './modules');
    const outputFile = path.resolve(dirname, './dist/compiled.js');

    const bundle = await rollup({
        input,
        external: ['lwc'],
        plugins: [
            lwcRollupPlugin({
                enableDynamicComponents: true,
                modules: [
                    {
                        dir: modulesDir,
                    },
                ],
            }),
        ],
        onwarn({ message, code }) {
            // TODO [#3331]: The existing lwc:dynamic fixture test will generate warnings that can be safely suppressed.
            const shouldIgnoreWarning =
                message.includes('LWC1187') ||
                // TODO [#4497]: stop warning on duplicate slots or disallow them entirely (LWC1137 is duplicate slots)
                message.includes('LWC1137') ||
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

function testFixtures() {
    testFixtureDir(
        {
            root: path.resolve(__dirname, 'fixtures'),
            pattern: '**/index.js',
        },
        async ({ filename, dirname, config }) => {
            const compiledFixturePath = await compileFixture({
                input: filename,
                dirname,
            });

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
                result = lwcEngineServer!.renderComponent(
                    module!.tagName,
                    module!.default,
                    config?.props ?? {}
                );
            } catch (_err: any) {
                err = _err.message;
            }
            features.forEach((flag) => {
                lwcEngineServer!.setFeatureFlagForTest(flag, false);
            });

            return {
                'expected.html': result ? formatHTML(result) : '',
                'error.txt': err ?? '',
            };
        }
    );
}

describe('fixtures', () => {
    testFixtures();
});
