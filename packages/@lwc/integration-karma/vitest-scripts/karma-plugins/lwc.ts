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

const IMPLICIT_DEFAULT_HTML_PATH = '@lwc/resources/empty_html.js';
const EMPTY_IMPLICIT_HTML_CONTENT = 'export default void 0';
const IMPLICIT_DEFAULT_CSS_PATH = '@lwc/resources/empty_css.css';
const EMPTY_IMPLICIT_CSS_CONTENT = '';

export default function vitestPluginLwc(pluginOptions: VitestLwcOptions): Plugin {
    const rollupPlugin = rollupPluginLwc({
        rootDir: pluginOptions.dir,
        include: ['test/**/*.spec.js', 'test/**/*.js', 'test/**/*.html', 'test/**/*.css'],
        apiVersion: 63,
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
                    apiVersion: 63,
                });
            }

            if (importerPath.ext === '.html') {
                const rootDir = path.resolve(importerPath.dir, '../..');

                rollupPlugin.api.updateOptions({
                    rootDir,
                });

                // namespace/name
                if (!source.startsWith('.') && !source.startsWith('/')) {
                    const sourceParts = source.split('/');

                    if (sourceParts.length === 2) {
                        const [namespace, name] = sourceParts;
                        return path.join(rootDir, namespace, name, `${name}.html`);
                    }
                }

                // if (source.endsWith('.css?scoped=true')) {
                //     const css = source.replace('?scoped=true', '');

                //     if (css.endsWith('.scoped.css')) {
                //         return css.replace('.scoped.css', '.css');
                //     } else {
                //         return css;
                //     }
                // }

                // if (source.endsWith('.scoped.css')) {
                //     return source.replace('.scoped.css', '.css');
                // }
            }

            // @ts-expect-error rollupPlugin is not defined
            return rollupPlugin.resolveId!.call(this, source, importer);
        },
        load(id, _options) {
            if (id === IMPLICIT_DEFAULT_HTML_PATH) {
                return EMPTY_IMPLICIT_HTML_CONTENT;
            }

            if (id === IMPLICIT_DEFAULT_CSS_PATH) {
                return EMPTY_IMPLICIT_CSS_CONTENT;
            }

            // @ts-expect-error rollupPlugin is not defined
            return rollupPlugin.load!.call(this, id);
        },
        transform(code, id, _options) {
            // @ts-expect-error rollupPlugin is not defined
            return rollupPlugin.transform!.call(this, code, id);
        },
    };
}
