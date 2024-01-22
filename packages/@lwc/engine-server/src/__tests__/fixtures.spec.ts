/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import fs from 'fs';
import path from 'path';

import { rollup, RollupLog } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { isVoidElement, HTML_NAMESPACE } from '@lwc/shared';
import { testFixtureDir } from '@lwc/jest-utils-lwc-internals';
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
    // TODO [#3331]: this is only needed to silence warnings on lwc:dynamic, remove in 246.
    const warnings: RollupLog[] = [];

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
        onwarn(warning) {
            warnings.push(warning);
        },
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

            // Special handling for `<style>` tags – these are not encoded, so we may hit '<' or '>'
            // inside the text content. So we just serialize it as-is.
            if (tagNameMatch![0] === 'style') {
                const styleMatch = src.slice(pos).match(/<style([\s\S]*?)>([\s\S]*?)<\/style>/);
                if (styleMatch) {
                    // opening tag
                    const [wholeMatch, attrs, textContent] = styleMatch!;
                    res += getPadding() + `<style${attrs}>` + '\n';
                    depth++;
                    res += getPadding() + textContent + '\n';
                    depth--;
                    res += getPadding() + '</style>' + '\n';
                    start = pos = pos + wholeMatch.length;
                    continue;
                }
            }

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

            let result;
            let err;
            try {
                result = lwcEngineServer!.renderComponent(
                    module!.tagName,
                    module!.default,
                    config.props || {}
                );
            } catch (_err: any) {
                err = _err.message;
            }
            features.forEach((flag) => {
                lwcEngineServer!.setFeatureFlagForTest(flag, false);
            });

            return {
                'expected.html': result ? formatHTML(result) : undefined,
                'error.txt': err,
            };
        }
    );
}

describe('fixtures', () => {
    testFixtures();
});
