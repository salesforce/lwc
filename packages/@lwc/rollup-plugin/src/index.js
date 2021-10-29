/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const fs = require('fs');
const path = require('path');
const pluginUtils = require('@rollup/pluginutils');
const compiler = require('@lwc/compiler');
const { resolveModule } = require('@lwc/module-resolver');

const DEFAULT_MODULES = [
    { npm: '@lwc/engine-dom' },
    { npm: '@lwc/synthetic-shadow' },
    { npm: '@lwc/wire-service' },
];

const IMPLICIT_DEFAULT_HTML_PATH = '@lwc/resources/empty_html.js';
const EMPTY_IMPLICIT_HTML_CONTENT = 'export default void 0';

function isImplicitHTMLImport(importee, importer) {
    return (
        path.extname(importer) === '.js' &&
        path.extname(importee) === '.html' &&
        path.dirname(importer) === path.dirname(importee) &&
        path.basename(importer, '.js') === path.basename(importee, '.html')
    );
}

function parseQueryParamsForScopedOption(id) {
    const [filename, query] = id.split('?', 2);
    const params = query && new URLSearchParams(query);
    const scoped = !!(params && params.get('scoped'));
    return {
        filename,
        scoped,
    };
}

module.exports = function rollupLwcCompiler(pluginOptions = {}) {
    const { include, exclude } = pluginOptions;
    const filter = pluginUtils.createFilter(include, exclude);

    let customResolvedModules;
    let customRootDir;

    return {
        name: 'rollup-plugin-lwc-compiler',

        options({ input }) {
            const { modules: userModules = [], rootDir } = pluginOptions;

            customRootDir = rootDir ? path.resolve(rootDir) : path.dirname(path.resolve(input));
            customResolvedModules = [...userModules, ...DEFAULT_MODULES, { dir: customRootDir }];
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
                        modules: customResolvedModules,
                        rootDir: customRootDir,
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

            const { code, map } = compiler.transformSync(src, id, {
                name,
                namespace,
                outputConfig: { sourcemap: pluginOptions.sourcemap },
                stylesheetConfig: pluginOptions.stylesheetConfig,
                experimentalDynamicComponent: pluginOptions.experimentalDynamicComponent,
                preserveHtmlComments: pluginOptions.preserveHtmlComments,
                scopedStyles: scoped,
            });

            return { code, map };
        },
    };
};
