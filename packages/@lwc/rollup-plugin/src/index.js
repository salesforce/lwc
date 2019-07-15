/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const fs = require('fs');
const path = require('path');
const compiler = require('@lwc/compiler');
const pluginUtils = require('rollup-pluginutils');
const lwcResolver = require('@lwc/module-resolver');
const { getModuleQualifiedName } = require('./utils');
const { DEFAULT_OPTIONS, DEFAULT_MODE, DEFAULT_MODULES } = require('./constants');

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

module.exports = function rollupLwcCompiler(pluginOptions = {}) {
    const { include, exclude } = pluginOptions;
    const filter = pluginUtils.createFilter(include, exclude);
    const mergedPluginOptions = Object.assign({}, DEFAULT_OPTIONS, pluginOptions);

    // Closure to store the resolved modules
    let modulePaths = {};

    return {
        name: 'rollup-plugin-lwc-compiler',

        options({ modules: userModules, rootDir, input }) {
            const defaultSrc = path.dirname(input);
            const modules = DEFAULT_MODULES.concat(userModules ? userModules : [defaultSrc]);
            const resolvedModules = lwcResolver.resolveModules({ rootDir, modules });
            modulePaths = resolvedModules.reduce((map, m) => ((map[m.specifier] = m), map), {});
        },

        resolveId(importee, importer) {
            // Resolve entry point if the import references a LWC module
            if (modulePaths[importee]) {
                return modulePaths[importee].entry;
            }

            // Normalize relative import to absolute import
            if (importee.startsWith('.') && importer) {
                const normalizedPath = path.resolve(path.dirname(importer), importee);
                const absPath = pluginUtils.addExtension(normalizedPath);

                if (isImplicitHTMLImport(normalizedPath, importer) && !fs.existsSync(absPath)) {
                    return IMPLICIT_DEFAULT_HTML_PATH;
                }

                return pluginUtils.addExtension(normalizedPath);
            }
        },

        load(id) {
            if (id === IMPLICIT_DEFAULT_HTML_PATH) {
                return EMPTY_IMPLICIT_HTML_CONTENT;
            }

            const exists = fs.existsSync(id);
            const isCSS = path.extname(id) === '.css';

            if (!exists && isCSS) {
                return '';
            }
        },

        async transform(src, id) {
            // Filter user-land config and lwc import
            if (!filter(id)) {
                return;
            }

            // If we don't find the moduleId, just resolve the module name/namespace
            const moduleEntry = Object.values(modulePaths).find(r => id === r.entry);
            const moduleRegistry = moduleEntry || getModuleQualifiedName(id, mergedPluginOptions);

            const { code, map } = await compiler.transform(src, id, {
                mode: DEFAULT_MODE, // Use always default mode since any other (prod or compat) will be resolved later
                name: moduleRegistry.moduleName,
                namespace: moduleRegistry.moduleNamespace,
                moduleSpecifier: moduleRegistry.moduleSpecifier,
                outputConfig: { sourcemap: mergedPluginOptions.sourcemap },
                stylesheetConfig: mergedPluginOptions.stylesheetConfig,
                experimentalDynamicComponent: mergedPluginOptions.experimentalDynamicComponent,
            });

            return { code, map };
        },
    };
};
