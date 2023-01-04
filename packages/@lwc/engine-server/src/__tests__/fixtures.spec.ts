/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import fs from 'fs';
import path from 'path';

import { rollup } from 'rollup';
// @ts-ignore
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { isVoidElement, HTML_NAMESPACE } from '@lwc/shared';
import { testFixtureDir } from '@lwc/jest-utils-lwc-internals';
import { setFeatureFlagForTest } from '../index';
import type { FeatureFlagMap } from '@lwc/features';
import type * as lwc from '../index';

interface FixtureModule {
    tagName: string;
    default: typeof lwc.LightningElement;
    props?: { [key: string]: any };
    features?: any[];
}

jest.setTimeout(10_000 /* 10 seconds */);

async function compileFixture({ input, dirname }: { input: string; dirname: string }) {
    const modulesDir = path.resolve(dirname, './modules');
    const outputFile = path.resolve(dirname, './dist/compiled.js');

    const bundle = await rollup({
        input,
        external: ['lwc'],
        plugins: [
            lwcRollupPlugin({
                enableScopedSlots: true,
                modules: [
                    {
                        dir: modulesDir,
                    },
                ],
            }),
        ],
    });

    await bundle.write({
        file: outputFile,
        format: 'cjs',
        exports: 'named',
    });

    return outputFile;
}

/**
 * Naive HTML fragment formatter.
 *
 * This is a replacement for Prettier HTML formatting. Prettier formatting is too aggressive for
 * fixture testing. It not only indent the HTML code but also fixes HTML issues. For testing we want
 * to make sure that the fixture file is as close as possible to what the engine produces.
 *
 * @param src the original HTML fragment.
 * @returns the formatter HTML fragment.
 */
function formatHTML(src: string): string {
    let res = '';
    let pos = 0;
    let start = pos;

    let depth = 0;

    const getPadding = () => {
        return '  '.repeat(depth);
    };

    while (pos < src.length) {
        // Consume element tags and comments.
        if (src.charAt(pos) === '<') {
            const tagNameMatch = src.slice(pos).match(/(\w+)/);

            const isVoid = isVoidElement(tagNameMatch![0], HTML_NAMESPACE);
            const isClosing = src.charAt(pos + 1) === '/';
            const isComment =
                src.charAt(pos + 1) === '!' &&
                src.charAt(pos + 2) === '-' &&
                src.charAt(pos + 3) === '-';

            start = pos;
            while (src.charAt(pos++) !== '>') {
                // Keep advancing until consuming the closing tag.
            }

            // Adjust current depth and print the element tag or comment.
            if (isClosing) {
                depth--;
            }

            res += getPadding() + src.slice(start, pos) + '\n';

            const isSelfClosing = src.charAt(pos - 2) === '/';
            if (!isClosing && !isSelfClosing && !isVoid && !isComment) {
                depth++;
            }
        }

        // Consume text content.
        start = pos;
        while (src.charAt(pos) !== '<' && pos < src.length) {
            pos++;
        }

        if (start !== pos) {
            res += getPadding() + src.slice(start, pos) + '\n';
        }
    }

    return res.trim();
}

function testFixtures() {
    testFixtureDir(
        {
            root: path.resolve(__dirname, 'fixtures'),
            pattern: '**/index.js',
        },
        async ({ filename, dirname }) => {
            const configPath = path.resolve(dirname, 'config.json');

            let config: any = {};
            if (fs.existsSync(configPath)) {
                config = require(configPath);
            }

            const compiledFixturePath = await compileFixture({
                input: filename,
                dirname,
            });

            // The LWC engine holds global state like the current VM index, which has an impact on
            // the generated HTML IDs. So the engine has to be re-evaluated between tests.
            // On top of this, the engine also checks if the component constructor is an instance of
            // the LightningElement. Therefor the compiled module should also be evaluated in the
            // same sandbox registry as the engine.
            let lwcEngineServer: typeof lwc | undefined;
            let module: FixtureModule | undefined;
            jest.isolateModules(() => {
                lwcEngineServer = require('../index');
                module = require(compiledFixturePath);
            });

            const features = module!.features ?? [];
            features.forEach((flag) => {
                lwcEngineServer!.setFeatureFlagForTest(flag, true);
            });

            lwcEngineServer!.setHooks({
                sanitizeHtmlContent(content: unknown) {
                    return content as string;
                },
            });

            const result = lwcEngineServer!.renderComponent(
                module!.tagName,
                module!.default,
                config.props || {}
            );
            features.forEach((flag) => {
                lwcEngineServer!.setFeatureFlagForTest(flag, false);
            });

            return {
                'expected.html': formatHTML(result),
            };
        }
    );
}

// Run the fixtures with both synthetic and native custom element lifecycle.
// The expectation is that the fixtures will be exactly the same for both.
describe('fixtures', () => {
    describe('synthetic custom element lifecycle', () => {
        testFixtures();
    });

    function testWithFeatureFlagEnabled(flagName: keyof FeatureFlagMap) {
        beforeEach(() => {
            setFeatureFlagForTest(flagName, true);
        });

        afterEach(() => {
            setFeatureFlagForTest(flagName, false);
        });

        testFixtures();
    }

    describe('native custom element lifecycle', () => {
        testWithFeatureFlagEnabled('ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE');
    });

    describe('disable aria reflection polyfill', () => {
        testWithFeatureFlagEnabled('DISABLE_ARIA_REFLECTION_POLYFILL');
    });
});
