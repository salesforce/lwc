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

function isMixingJsAndTs(importerExt, importeeExt) {
    return (
        (importerExt === '.js' && importeeExt === '.ts') ||
        (importerExt === '.ts' && importeeExt === '.js')
    );
}

// From a list of modules resolved, create an Map for faster moduleId seach
function createMapFromCollectedModules(modules) {
    return modules.reduce((map, moduleRecord) => {
        const id = moduleRecord.specifier;
        const entry = map.get(id) || [];
        entry.push(moduleRecord);
        // We need to sort them by the longest scope so we find the most specific first
        entry.sort((a, b) => b.scope.length - a.scope.length);
        return map.set(id, entry);
    }, new Map());
}

module.exports = function rollupLwcCompiler(pluginOptions = {}) {
    const { include, exclude } = pluginOptions;
    const filter = pluginUtils.createFilter(include, exclude);
    const mergedPluginOptions = Object.assign({}, DEFAULT_OPTIONS, pluginOptions);

    // Closure to store the resolved modules
    let resolvedModulesIndex = [];

    return {
        name: 'rollup-plugin-lwc-compiler',

        options({ input }) {
            const { modules: userModules = [], rootDir: rollupRootDir } = mergedPluginOptions;
            const rootDir = rollupRootDir ? path.resolve(rollupRootDir) : rollupRootDir;
            const defaultModulesDir = rootDir || path.dirname(input);
            const modules = [...userModules, ...DEFAULT_MODULES, { dir: defaultModulesDir }];
            const collectedModules = lwcResolver.resolveModules({ rootDir, modules });
            resolvedModulesIndex = createMapFromCollectedModules(collectedModules);
        },

        resolveId(importee, importer) {
            // Resolve entry point if the import references a LWC module
            if (resolvedModulesIndex.has(importee)) {
                const matches = resolvedModulesIndex.get(importee);
                if (matches.length > 1) {
                    const match = matches.find(m => importer.startsWith(m.scope));
                    if (match) {
                        return match.entry;
                    }
                } else {
                    return matches[0].entry;
                }
            }

            // Normalize relative import to absolute import
            if (importee.startsWith('.') && importer) {
                const importerExt = path.extname(importer);
                const ext = path.extname(importee) || importerExt;

                // we don't currently support mixing .js and .ts
                if (isMixingJsAndTs(importerExt, ext)) {
                    throw new Error(
                        `Importing a ${ext} file into a ${importerExt} is not supported`
                    );
                }

                const normalizedPath = path.resolve(path.dirname(importer), importee);
                const absPath = pluginUtils.addExtension(normalizedPath, ext);

                if (isImplicitHTMLImport(normalizedPath, importer) && !fs.existsSync(absPath)) {
                    return IMPLICIT_DEFAULT_HTML_PATH;
                }

                return pluginUtils.addExtension(normalizedPath, ext);
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
            const moduleEntry = getModuleQualifiedName(id, mergedPluginOptions);

            const { code, map } = await compiler.transform(src, id, {
                mode: DEFAULT_MODE, // Use always default mode since any other (prod or compat) will be resolved later
                name: moduleEntry.moduleName,
                namespace: moduleEntry.moduleNamespace,
                moduleSpecifier: moduleEntry.moduleSpecifier,
                outputConfig: { sourcemap: mergedPluginOptions.sourcemap },
                stylesheetConfig: mergedPluginOptions.stylesheetConfig,
                experimentalDynamicComponent: mergedPluginOptions.experimentalDynamicComponent,
            });

            return { code, map };
        },
    };
};
