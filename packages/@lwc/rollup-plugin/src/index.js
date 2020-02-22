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

function validateUserModules(modules = []) {
    if (modules.length) {
        const hasNpmModuleRecords = modules.some(lwcResolver.isNpmModuleRecord);
        if (hasNpmModuleRecords) {
            throw new Error('Resolution of npm modules are not allowed in rollup config');
        }
    }
}

function validateResolvedModuleRecords(moduleRecords = []) {
    const visited = new Set();
    if (moduleRecords.length) {
        moduleRecords.forEach(({ specifier, scope, version }) => {
            const id = `${specifier}:${version}:${scope}`;
            if (visited.has(id)) {
                throw new Error(`Duplicated entry: ${id}`);
            } else {
                visited.add(id);
            }
        });
    }
}

module.exports = function rollupLwcCompiler(pluginOptions = {}) {
    const { include, exclude } = pluginOptions;
    const filter = pluginUtils.createFilter(include, exclude);
    const mergedPluginOptions = Object.assign({}, DEFAULT_OPTIONS, pluginOptions);

    let customResolvedModules;

    return {
        name: 'rollup-plugin-lwc-compiler',
        options({ input }) {
            const { modules: userModules = [], rootDir } = mergedPluginOptions;
            const defaultModulesDir = rootDir ? path.resolve(rootDir) : path.dirname(input);
            validateUserModules(userModules);
            const modules = [...userModules, ...DEFAULT_MODULES, { dir: defaultModulesDir }];
            const resolvedModules = lwcResolver.resolveModules({ rootDir, modules });
            validateResolvedModuleRecords(resolvedModules);
            customResolvedModules = resolvedModules.reduce(
                (map, m) => ((map[m.specifier] = m.entry), map),
                {}
            );
        },

        resolveId(importee, importer) {
            // Custom resolved modules

            const customEntry = customResolvedModules[importee];
            if (customEntry) {
                return customEntry;
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
            } else {
                const moduleRecord = lwcResolver.resolveModule(importee, importer);
                if (moduleRecord) {
                    return moduleRecord.entry;
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
