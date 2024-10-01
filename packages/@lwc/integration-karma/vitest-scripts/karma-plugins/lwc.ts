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

export default function vitestPluginLwc(pluginOptions: VitestLwcOptions): Plugin {
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
            }

            // @ts-expect-error rollupPlugin is not defined
            const id = rollupPlugin.resolveId!.call(this, source, importer);

            if (id) {
                if (id === '@lwc/resources/empty_css.css') {
                    return id + '?inline';
                } else if (id.endsWith('.css')) {
                    return id + '?inline';
                }
                return id;
            }
        },
        load(id, _options) {
            // @ts-expect-error rollupPlugin is not defined
            return rollupPlugin.load!.call(this, id);
        },
        transform(code, id, _options) {
            if (id.endsWith('.css')) {
                return code;
            }
            // @ts-expect-error rollupPlugin is not defined
            return rollupPlugin.transform!.call(this, code, id);
        },
    };
}
