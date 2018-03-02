const fs = require("fs");
const path = require("path");
const compiler = require("lwc-compiler");
const pluginUtils = require("rollup-pluginutils");
const lwcResolver = require("lwc-module-resolver");
const rollupCompatPlugin = require("rollup-plugin-compat").default;

const { DEFAULT_NS, DEFAULT_OPTIONS, DEFAULT_MODE } = require("./constants");

function getModuleQualifiedName(file, { mapNamespaceFromPath }) {
    const registry = {
        entry: file,
        moduleSpecifier: null,
        moduleName: null,
        moduleNamespace: DEFAULT_NS
    };
    const fileName = path.basename(file, path.extname(file));
    const rootParts = path.dirname(file).split(path.sep);
    const nameParts = fileName.split("-");
    const validModuleName = nameParts.length > 1;

    if (mapNamespaceFromPath) {
        registry.moduleName = rootParts.pop();
        registry.moduleNamespace = rootParts.pop();
    } else if (validModuleName) {
        registry.moduleNamespace = nameParts.shift();
        registry.moduleName = nameParts.join("-");
    } else {
        registry.moduleName = fileName;
    }

    return registry;
}

function normalizeResult(result) {
    return { code: result.code || result, map: result.map || { mappings: "" } };
}

/*
    API for rollup-compat plugin:
    {
        disableProxyTransform?: boolean,
        onlyProxyTransform?: boolean,
        downgrade?: boolean,
        resolveProxyCompat?
        polyfills?
    }
 */
module.exports = function rollupLwcCompiler(pluginOptions = {}) {
    const { include, exclude, mapNamespaceFromPath } = pluginOptions;
    const filter = pluginUtils.createFilter(include, exclude);
    const mergedPluginOptions = Object.assign(
        {},
        DEFAULT_OPTIONS,
        pluginOptions,
        {
            mapNamespaceFromPath: Boolean(mapNamespaceFromPath)
        }
    );
    const { mode, compat } = mergedPluginOptions;

    // We will compose compat plugin on top of this one
    const rollupCompatInstance = rollupCompatPlugin(compat);

    // Closure to store the resolved modules
    const modulePaths = {};

    return {
        name: "rollup-plugin-lwc-compiler",

        options(rollupOptions) {
            const entry = rollupOptions.input || rollupOptions.entry;
            const entryDir = mergedPluginOptions.rootDir || path.dirname(entry);
            const externalPaths = mergedPluginOptions.resolveFromPackages
                ? lwcResolver.resolveLwcNpmModules(mergedPluginOptions)
                : {};
            const sourcePaths = mergedPluginOptions.resolveFromSource
                ? lwcResolver.resolveModulesInDir(entryDir, mergedPluginOptions)
                : {};
            Object.assign(modulePaths, externalPaths, sourcePaths);
            rollupCompatInstance.options(rollupOptions);
        },

        resolveId(importee, importer) {
            // Resolve entry point if the import references a LWC module
            if (modulePaths[importee]) {
                return modulePaths[importee].entry;
            }

            // Normalize relative import to absolute import
            if (importee.startsWith(".") && importer) {
                const normalizedPath = path.resolve(
                    path.dirname(importer),
                    importee
                );
                return pluginUtils.addExtension(normalizedPath);
            }

            // Check if compat needs to resolve this file
            return rollupCompatInstance.resolveId(importee, importer);
        },

        load(id) {
            const exists = fs.existsSync(id);
            const isCSS = path.extname(id) === ".css";

            if (!exists && isCSS) {
                return "";
            }

            // Check if compat knows how to load this file
            return rollupCompatInstance.load(id);
        },

        async transform(code, id) {
            if (!filter(id)) {
                return;
            }

            // If we don't find the moduleId, just resolve the module name/namespace
            const moduleEntry = Object.values(modulePaths).find(
                r => id === r.entry
            );
            const moduleRegistry =
                moduleEntry || getModuleQualifiedName(id, mergedPluginOptions);

            let result = code;

            if (!rollupCompatInstance.knownCompatModule(id)) {
                result = await compiler.transform(code, id, {
                    mode: DEFAULT_MODE, // Use always default mode since any other (prod or compat) will be resolved later
                    moduleName: moduleRegistry.moduleName,
                    moduleNamespace: moduleRegistry.moduleNamespace,
                    moduleSpecifier: moduleRegistry.moduleSpecifier
                });
            }

            result = normalizeResult(result);

            if (mode === "compat" || mode === "prod_compat") {
                result = normalizeResult(
                    rollupCompatInstance.transform(result.code, id)
                );
            }

            return { code: result.code, map: result.map };
        }
    };
};
