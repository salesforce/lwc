/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';

import { Plugin } from 'rollup';
import pluginUtils, { FilterPattern } from '@rollup/pluginutils';

import { transformSync } from '@lwc/compiler';
import { resolveModule, ModuleRecord } from '@lwc/module-resolver';

export interface RollupLwcOptions {
    include?: FilterPattern;
    exclude?: FilterPattern;
    rootDir?: string;
    sourcemap?: boolean;
    environment?: 'dom' | 'server';
    modules?: ModuleRecord[];
    stylesheetConfig?: any;
}

const IMPLICIT_DEFAULT_HTML_PATH = '@lwc/resources/empty_html.js';

const EMPTY_IMPLICIT_HTML_CONTENT = 'export default void 0';
const EMPTY_IMPLICIT_CSS_CONTENT = '';

function isImplicitHTMLImport(importee: string, importer: string): boolean {
    return (
        path.extname(importer) === '.js' &&
        path.extname(importee) === '.html' &&
        path.dirname(importer) === path.dirname(importee) &&
        path.basename(importer, '.js') === path.basename(importee, '.html')
    );
}

function lwc(options: RollupLwcOptions = {}): Plugin {
    let { rootDir, modules = [] } = options;
    const { stylesheetConfig, sourcemap = false, environment = 'dom' } = options;

    if (environment !== 'dom' && environment !== 'server') {
        throw new TypeError(
            `Invalid "environment" option. Received ${environment} but expected "dom", "server" or undefined.`
        );
    }

    const filter = pluginUtils.createFilter(options.include, options.exclude);

    return {
        name: 'lwc',

        buildStart({ input }) {
            if (rootDir === undefined) {
                if (Array.isArray(input)) {
                    rootDir = path.dirname(input[0]);

                    if (input.length > 1) {
                        this.warn(
                            `The "rootDir" option should be explicitly set when passing an "input" array to rollup. The "rootDir" option is implicitly resolved to ${rootDir}.`
                        );
                    }
                } else {
                    rootDir = path.dirname(Object.values(input)[0]);

                    this.warn(
                        `The "rootDir" option should be explicitly set when passing "input" object to rollup. The "rootDir" option is implicitly resolved to ${rootDir}.`
                    );
                }
            } else {
                rootDir = path.resolve(rootDir);
            }

            modules = [...modules, { dir: rootDir }, { npm: 'lwc' }];
        },

        resolveId(importee, importer) {
            if (importer === undefined) {
                return;
            }

            const isRelativeImport = importee.startsWith('.');
            if (isRelativeImport) {
                const importerExt = path.extname(importer);
                const ext = path.extname(importee) || importerExt;

                const normalizedPath = path.resolve(path.dirname(importer), importee);
                const absPath = pluginUtils.addExtension(normalizedPath, ext);

                if (isImplicitHTMLImport(normalizedPath, importer) && !fs.existsSync(absPath)) {
                    return IMPLICIT_DEFAULT_HTML_PATH;
                }

                return absPath;
            } else {
                if (importee === 'lwc') {
                    importee = environment === 'dom' ? '@lwc/engine-dom' : '@lwc/engine-server';
                }

                try {
                    return resolveModule(importee, importer, {
                        modules,
                        rootDir,
                    }).entry;
                } catch (err) {
                    if (err.code !== 'NO_LWC_MODULE_FOUND') {
                        throw err;
                    }
                }
            }
        },

        load(id) {
            if (id === IMPLICIT_DEFAULT_HTML_PATH) {
                return EMPTY_IMPLICIT_HTML_CONTENT;
            }

            const exists = fs.existsSync(id);
            const isCSS = path.extname(id) === '.css';

            if (!exists && isCSS) {
                return EMPTY_IMPLICIT_CSS_CONTENT;
            }
        },

        async transform(src, id) {
            if (!filter(id)) {
                return;
            }

            const nameParts = path.dirname(id).split(path.sep);
            const name = nameParts.pop();
            const namespace = nameParts.pop();

            return transformSync(src, id, {
                name,
                namespace,
                stylesheetConfig,
                outputConfig: { sourcemap },
                experimentalDynamicComponent: (options as any).experimentalDynamicComponent,
            });
        },
    };
}

// In order to keep backward compatibility with commonjs format, we can't use the export default.
// Using export default will result in consumer importing the plugin via
// `require("@lwc/rollup-plugin").default`. We should revisit this for the next major release.
module.exports = lwc;
module.exports.default = lwc;
