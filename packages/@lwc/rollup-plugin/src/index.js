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
const semver = require('semver');
const pkg = require('../package.json');

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

        buildStart() {
            if (!semver.satisfies(this.meta.rollupVersion, pkg.peerDependencies.rollup)) {
                throw new Error(
                    `@lwc/rollup-plugin requires Rollup version ${pkg.peerDependencies.rollup} (found: ${this.meta.rollupVersion}). Please update Rollup.`
                );
            }
        },

        resolveId(importee, importer) {
            // Normalize relative import to absolute import
            // Note that in @rollup/plugin-node-resolve v13, relative imports will sometimes
            // be in absolute format (e.g. "/path/to/module.js") so we have to check that as well.
            if ((importee.startsWith('.') || importee.startsWith('/')) && importer) {
                const { scoped, filename } = parseQueryParamsForScopedOption(importee);
                if (scoped) {
                    importee = filename; // remove query param
                }
                const importerExt = path.extname(importer);
                const ext = path.extname(importee) || importerExt;

                const normalizedPath = path.resolve(path.dirname(importer), importee);
                const absPath = pluginUtils.addExtension(normalizedPath, ext);

                if (isImplicitHTMLImport(normalizedPath, importer) && !fs.existsSync(absPath)) {
                    return IMPLICIT_DEFAULT_HTML_PATH;
                }

                return {
                    id: pluginUtils.addExtension(normalizedPath, ext),
                    meta: { lwcScopedStyles: scoped },
                };
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

            const isCSS = path.extname(id) === '.css';

            if (isCSS) {
                const exists = fs.existsSync(id);
                if (!exists) {
                    return '';
                }
            }
        },

        transform(src, id) {
            // Filter user-land config and lwc import
            if (!filter(id)) {
                return;
            }

            // Extract module name and namespace from file path
            const [namespace, name] = path.dirname(id).split(path.sep).slice(-2);

            const scopedStyles = this.getModuleInfo(id).meta.lwcScopedStyles;

            const { code, map } = compiler.transformSync(src, id, {
                name,
                namespace,
                outputConfig: { sourcemap: pluginOptions.sourcemap },
                stylesheetConfig: pluginOptions.stylesheetConfig,
                experimentalDynamicComponent: pluginOptions.experimentalDynamicComponent,
                preserveHtmlComments: pluginOptions.preserveHtmlComments,
                scopedStyles,
            });

            return { code, map };
        },
    };
};
