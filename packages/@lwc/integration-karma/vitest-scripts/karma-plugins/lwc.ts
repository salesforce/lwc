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

            if (importer.endsWith('.spec.js')) {
                rollupPlugin.api.updateOptions({
                    rootDir: path.parse(importer).dir,
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
