/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'node:path';
import { rm } from 'node:fs/promises';
import { vi, test, beforeAll, describe } from 'vitest';
import { rollup } from 'rollup';
import lwcRollupPlugin, { RollupLwcOptions } from '@lwc/rollup-plugin';
import { glob } from 'glob';
import { formatHTML } from '@lwc/test-utils-lwc-internals';
import * as lwc from '../index';

vi.mock(import('@lwc/module-resolver'), async (importOriginal) => {
    const mod = await importOriginal();
    return {
        ...mod,
        resolveModule(importee, importer, ..._) {
            const dirname = path.dirname(importer);
            const dir = dirname.includes('/modules/')
                ? path.resolve(dirname, '../..')
                : path.join(dirname, 'modules');
            return mod.resolveModule(importee, dirname, {
                modules: [
                    { npm: '@lwc/engine-dom' },
                    { npm: '@lwc/synthetic-shadow' },
                    { npm: '@lwc/wire-service' },
                    { dir },
                ],
                rootDir: dirname,
            });
        },
    };
});

interface FixtureModule {
    tagName: string;
    default: typeof lwc.LightningElement;
    props?: { [key: string]: any };
    features?: any[];
}

lwc.setHooks({
    sanitizeHtmlContent(content: unknown) {
        return String(content);
    },
});

vi.mock('lwc', () => {
    return lwc;
});

async function compileFixture(
    {
        input,
        dir,
    }: {
        input: string[] | Record<string, string>;
        dir: string;
    },
    options: RollupLwcOptions = {}
) {
    const loader = path.join(__dirname, './utils/custom-loader.js');

    const bundle = await rollup({
        input,
        external: ['lwc', 'vitest', loader],
        plugins: [
            lwcRollupPlugin({
                rootDir: '.',
                enableDynamicComponents: true,
                experimentalDynamicComponent: {
                    loader,
                    strictSpecifier: false,
                },
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
        dir,
        format: 'esm',
        exports: 'named',
    });
}

const fixtureDir = path.resolve(__dirname, `./fixtures`);
const fixtures = glob.sync('**/index.js', {
    ignore: ['**/dist/**'],
    cwd: fixtureDir,
});

const input = Object.fromEntries(
    fixtures.map((f) => [f.replace('.js', ''), path.resolve(fixtureDir, f)])
);

describe.concurrent('default', () => {
    const dir = path.resolve(fixtureDir, './dist/default');
    beforeAll(async () => {
        await rm(dir, { recursive: true, force: true });
        await compileFixture({ input, dir });
    });
    test.for(fixtures)('%s', { concurrent: true }, async (fixture, { expect }) => {
        const dirname = path.dirname(fixture);
        const mod: FixtureModule = await import(`./fixtures/dist/default/${fixture}`);
        const result = await renderComponent(mod, dirname);
        await Promise.all([
            expect(formatHTML(result.expected)).toMatchFileSnapshot(
                `./fixtures/${dirname}/expected.html`
            ),
            expect(result.error).toMatchFileSnapshot(`./fixtures/${dirname}/error.txt`),
        ]);
    });
});

describe.concurrent('enableStaticContentOptimization=false', () => {
    const dir = path.resolve(fixtureDir, './dist/static-content-optimization-false');
    beforeAll(async () => {
        await rm(dir, { recursive: true, force: true });
        await compileFixture({ input, dir }, { enableStaticContentOptimization: false });
    });
    test.for(fixtures)('%s', { concurrent: true }, async (fixture, { expect }) => {
        const dirname = path.dirname(fixture);
        const mod: FixtureModule = await import(
            `./fixtures/dist/static-content-optimization-false/${fixture}`
        );
        const result = await renderComponent(mod, dirname);
        await Promise.all([
            expect(formatHTML(result.expected)).toMatchFileSnapshot(
                `./fixtures/${dirname}/expected.html`
            ),
            expect(result.error).toMatchFileSnapshot(`./fixtures/${dirname}/error.txt`),
        ]);
    });
});

async function renderComponent(mod: FixtureModule, dirname: string) {
    const result = { error: '', expected: '' };

    mod.features?.forEach((f) => {
        lwc.setFeatureFlagForTest(f, true);
    });

    let config = { props: mod.props };

    try {
        config = await import(`./fixtures/${dirname}/config.json`);
    } catch (_error) {
        // ignore missing config
    }

    try {
        result.expected = lwc.renderComponent(mod.tagName, mod.default, config.props);
    } catch (_error: any) {
        if (_error.name === 'AssertionError') {
            throw _error;
        } else {
            result.error = _error.message;
        }
    }

    mod.features?.forEach((f) => {
        lwc.setFeatureFlagForTest(f, false);
    });

    return result;
}
