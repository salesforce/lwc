/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';
import rollupPluginLwc from '@lwc/rollup-plugin';
import type { Plugin } from 'vitest/config';

export type VitestLwcOptions = {
    dir: string;
};

function vitestPluginLwc(pluginOptions: VitestLwcOptions): Plugin {
    const rollupPlugin = rollupPluginLwc({
        rootDir: pluginOptions.dir,
        include: ['test/**/*.spec.js', 'test/**/*.js', 'test/**/*.html', 'test/**/*.css'],
        enableDynamicComponents: true,
        experimentalDynamicComponent: {
            loader: 'test-utils',
            // @ts-expect-error experimentalDynamicComponent is not defined
            strict: true,
        },
    });

    return {
        name: 'vitest-plugin-lwc',
        enforce: 'post',

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
                rollupPlugin.api.updateOptions({
                    rootDir: importerPath.dir,
                    experimentalComplexExpressions:
                        importerPath.dir.includes('template-expressions'),
                });
            } else if (importerPath.ext === '.html' || importerPath.ext === '.js') {
                const rootDir = path.resolve(importerPath.dir, '../..');

                rollupPlugin.api.updateOptions({
                    rootDir,
                });
            }

            // @ts-expect-error rollupPlugin is not defined
            const id = rollupPlugin.resolveId!.call(this, source, importer);

            return id;
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

export const vitestPluginCss = (_pluginOptions: VitestLwcOptions): Plugin => ({
    name: 'patch-css-modules',
    enforce: 'pre',
    configResolved: (config) => {
        const viteCssPostPluginIndex = config.plugins.findIndex(
            (plugin) => plugin.name === 'vite:css-post'
        );

        if (viteCssPostPluginIndex === -1) {
            throw new Error('vite:css-post plugin not found');
        }

        const viteCssPostPlugin = config.plugins[viteCssPostPluginIndex]!;

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

            return Reflect.apply(transform, this, [code, id, options]);
        };
    },
});

export default (pluginOptions: VitestLwcOptions) => [
    vitestPluginCss(pluginOptions),
    vitestPluginLwc(pluginOptions),
];
