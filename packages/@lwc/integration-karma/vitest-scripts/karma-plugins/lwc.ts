/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';
import rollupPluginLwc from '@lwc/rollup-plugin';
import type { Plugin } from 'vitest/config';

function vitestPluginLwc(): Plugin {
    let rollupPlugin: Plugin<any> | undefined;

    return {
        name: 'vitest-plugin-lwc',
        enforce: 'post',
        configResolved(config) {
            const { test } = config;

            if (test === undefined) {
                throw new Error('vitest-plugin-lwc requires a test config');
            }

            const { dir } = test;

            if (dir === undefined) {
                throw new Error('vitest-plugin-lwc requires a test dir');
            }

            rollupPlugin = rollupPluginLwc({
                rootDir: dir,
                include: ['**/*.spec.js', '**/*.js', '**/*.html', '**/*.css'].map((pattern) =>
                    path.join(dir, pattern)
                ),
                enableDynamicComponents: true,
                experimentalDynamicComponent: {
                    loader: 'test-utils',
                    // @ts-expect-error experimentalDynamicComponent is not defined
                    strict: true,
                },
            });
        },
        buildStart(options) {
            // @ts-expect-error rollupPlugin is not defined
            return rollupPlugin.buildStart!.call(this, options);
        },
        resolveId(source, importer, _options) {
            if (!importer) {
                return;
            }

            const importerPath = path.parse(importer);

            if (importerPath.base.endsWith('.spec.js')) {
                rollupPlugin!.api.updateOptions({
                    rootDir: importerPath.dir,
                    experimentalComplexExpressions:
                        importerPath.dir.includes('template-expressions'),
                });
            } else if (importerPath.ext === '.html' || importerPath.ext === '.js') {
                const rootDir = path.resolve(importerPath.dir, '../..');

                rollupPlugin!.api.updateOptions({
                    rootDir,
                });
            }

            // @ts-expect-error rollupPlugin is not defined
            return rollupPlugin.resolveId!.call(this, source, importer);
        },
        load(id, _options) {
            // @ts-expect-error rollupPlugin is not defined
            return rollupPlugin.load!.call(this, id);
        },
        transform(code, id, _options) {
            // @ts-expect-error rollupPlugin is not defined
            return rollupPlugin.transform!.call(this, code, id);
        },
    };
}

function vitestPluginCss(): Plugin {
    return {
        name: 'vitest-plugin-css',
        enforce: 'pre',
        configResolved(config) {
            const plugins = config.plugins;
            patchViteCssPlugin(plugins);
            patchViteCssPostPlugin(plugins);
        },
    };
}

export default () => [vitestPluginCss(), vitestPluginLwc()];

function patchViteCssPlugin(plugins: readonly Plugin<any>[]) {
    const viteCssPlugin = plugins.find((plugin) => plugin.name === 'vite:css');

    if (viteCssPlugin === undefined) {
        throw new Error('vite:css plugin not found');
    }

    const { transform } = viteCssPlugin;

    if (typeof transform !== 'function') {
        throw new Error('vite:css plugin transform is not a function');
    }

    viteCssPlugin.transform = function (code: string, id: string, options) {
        if (id === '@lwc/resources/empty_css.css') {
            return {
                code: 'export default ""',
                map: null,
            };
        }

        if (id.endsWith('.css')) {
            return;
        }

        if (id.endsWith('.css?scoped=true')) {
            return;
        }

        return Reflect.apply(transform, this, [code, id, options]);
    };
}

function patchViteCssPostPlugin(plugins: readonly Plugin<any>[]) {
    const viteCssPostPlugin = plugins.find((plugin) => plugin.name === 'vite:css-post');

    if (viteCssPostPlugin === undefined) {
        throw new Error('vite:css-post plugin not found');
    }

    const { transform } = viteCssPostPlugin;

    if (typeof transform !== 'function') {
        throw new Error('vite:css-post plugin transform is not a function');
    }

    viteCssPostPlugin.transform = function (code: string, id: string, options) {
        if (id === '@lwc/resources/empty_css.css') {
            return {
                code: 'export default ""',
                map: null,
            };
        }

        if (id.endsWith('.css')) {
            return;
        }

        if (id.endsWith('.css?scoped=true')) {
            return;
        }

        return Reflect.apply(transform, this, [code, id, options]);
    };
}
