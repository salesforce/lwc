const fs = require("fs");
const path = require("path");
const compiler = require("lwc-compiler");
const pluginUtils = require("rollup-pluginutils");
const lwcResolver = require("lwc-module-resolver");
const { getModuleQualifiedName } = require('./utils');
const { DEFAULT_OPTIONS, DEFAULT_MODE } = require("./constants");

module.exports = function rollupLwcCompiler(pluginOptions = {}) {
    const { include, exclude } = pluginOptions;
    const filter = pluginUtils.createFilter(include, exclude);
    const mergedPluginOptions = Object.assign({}, DEFAULT_OPTIONS, pluginOptions);
    const { resolveFromPackages, resolveFromSource } = mergedPluginOptions;

    // Closure to store the resolved modules
    let modulePaths = {};

    return {
        name: "rollup-plugin-lwc-compiler",

        options(rollupOptions) {
            modulePaths = {};
            const entry = rollupOptions.input || rollupOptions.entry;
            const entryDir = mergedPluginOptions.rootDir || path.dirname(entry);
            const externalPaths = resolveFromPackages ? lwcResolver.resolveLwcNpmModules(mergedPluginOptions) : {};
            const sourcePaths = resolveFromSource ? lwcResolver.resolveModulesInDir(entryDir, mergedPluginOptions) : {};
            Object.assign(modulePaths, externalPaths, sourcePaths);
        },

        resolveId(importee, importer) {
            // Resolve entry point if the import references a LWC module
            if (modulePaths[importee]) {
                return modulePaths[importee].entry;
            }

            // Normalize relative import to absolute import
            if (importee.startsWith(".") && importer) {
                const normalizedPath = path.resolve(path.dirname(importer), importee);
                return pluginUtils.addExtension(normalizedPath);
            }
        },

        load(id) {
            const exists = fs.existsSync(id);
            const isCSS = path.extname(id) === ".css";

            if (!exists && isCSS) {
                return "";
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
                outputConfig: { sourcemap: mergedPluginOptions.sourcemap }
            });

            return { code, map };
        }
    };
};
