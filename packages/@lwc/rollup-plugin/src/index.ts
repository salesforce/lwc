/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';

import { Plugin, SourceMapInput } from 'rollup';
import pluginUtils, { FilterPattern } from '@rollup/pluginutils';
import { transformSync, StylesheetConfig } from '@lwc/compiler';
import { resolveModule, ModuleRecord } from '@lwc/module-resolver';
import { URLSearchParams } from 'url';

export interface RollupLwcOptions {
    include?: FilterPattern;
    exclude?: FilterPattern;
    rootDir?: string;
    sourcemap?: boolean;
    modules?: ModuleRecord[];
    stylesheetConfig?: StylesheetConfig;
    preserveHtmlComments?: boolean;
}

const DEFAULT_MODULES = [
    { npm: '@lwc/engine-dom' },
    { npm: '@lwc/synthetic-shadow' },
    { npm: '@lwc/wire-service' },
];

const IMPLICIT_DEFAULT_HTML_PATH = '@lwc/resources/empty_html.js';
const EMPTY_IMPLICIT_HTML_CONTENT = 'export default void 0';

function isImplicitHTMLImport(importee: string, importer: string): boolean {
    return (
        path.extname(importer) === '.js' &&
        path.extname(importee) === '.html' &&
        path.dirname(importer) === path.dirname(importee) &&
        path.basename(importer, '.js') === path.basename(importee, '.html')
    );
}

interface scopedOption {
    filename: string;
    scoped: boolean;
}

function parseQueryParamsForScopedOption(id: string): scopedOption {
    const [filename, query] = id.split('?', 2);
    const params = query && new URLSearchParams(query);
    const scoped = !!(params && params.get('scoped'));
    return {
        filename,
        scoped,
    };
}

export default function lwc(pluginOptions: RollupLwcOptions = {}): Plugin {
    const filter = pluginUtils.createFilter(pluginOptions.include, pluginOptions.exclude);

    let { rootDir, modules = [] } = pluginOptions;
    const { stylesheetConfig, sourcemap = false, preserveHtmlComments } = pluginOptions;

    return {
        name: 'rollup-plugin-lwc-compiler',

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

            modules = [...modules, { dir: rootDir }, ...DEFAULT_MODULES];
        },

        resolveId(importee, importer) {
            // Normalize relative import to absolute import
            // Note that in @rollup/plugin-node-resolve v13, relative imports will sometimes
            // be in absolute format (e.g. "/path/to/module.js") so we have to check that as well.
            if ((importee.startsWith('.') || importee.startsWith('/')) && importer) {
                const importerExt = path.extname(importer);
                const ext = path.extname(importee) || importerExt;

                const normalizedPath = path.resolve(path.dirname(importer), importee);
                const absPath = pluginUtils.addExtension(normalizedPath, ext);

                if (isImplicitHTMLImport(normalizedPath, importer) && !fs.existsSync(absPath)) {
                    return IMPLICIT_DEFAULT_HTML_PATH;
                }

                return pluginUtils.addExtension(normalizedPath, ext);
            } else if (importer) {
                // Could be an import like `import component from 'x/component'`
                try {
                    return resolveModule(importee, importer, {
                        modules,
                        rootDir,
                    }).entry;
                } catch (err: any) {
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

            // Have to parse the `?scoped=true` in `load`, because it's not guaranteed
            // that `resolveId` will always be called (e.g. if another plugin resolves it first)
            const { scoped, filename } = parseQueryParamsForScopedOption(id);
            if (scoped) {
                id = filename; // remove query param
            }
            const isCSS = path.extname(id) === '.css';

            if (isCSS) {
                const exists = fs.existsSync(id);
                const code = exists ? fs.readFileSync(id, 'utf8') : '';
                return code;
            }
        },

        transform(src, id) {
            // Filter user-land config and lwc import
            if (!filter(id)) {
                return;
            }

            const { scoped, filename } = parseQueryParamsForScopedOption(id);
            if (scoped) {
                id = filename; // remove query param
            }

            // Extract module name and namespace from file path
            const [namespace, name] = path.dirname(id).split(path.sep).slice(-2);

            const { code, map } = transformSync(src, id, {
                name,
                namespace,
                outputConfig: { sourcemap },
                stylesheetConfig,
                experimentalDynamicComponent: (pluginOptions as any).experimentalDynamicComponent,
                preserveHtmlComments,
                scopedStyles: scoped,
            });

            const rollupMap = map as SourceMapInput;
            return { code, map: rollupMap };
        },
    };
}

// In order to keep backward compatibility with commonjs format, we can't use the export default.
// Using export default will result in consumer importing the plugin via
// `require("@lwc/rollup-plugin").default`. We should revisit this for the next major release.
module.exports = lwc;
module.exports.default = lwc;
