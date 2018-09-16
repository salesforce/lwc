const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const minify = require("babel-preset-minify");
const compiler = require("lwc-compiler");
const pluginUtils = require("rollup-pluginutils");
const replacePlugin = require("rollup-plugin-replace");
const lwcResolver = require("lwc-module-resolver");

const { LWC_ENGINE, DEFAULT_OPTIONS, DEFAULT_MODE } = require("./constants");

function getModuleQualifiedName(file) {
    const registry = {
        entry: file,
        moduleSpecifier: null,
        moduleName: null,
        moduleNamespace: null
    };

    const rootParts = path.dirname(file).split(path.sep);

    registry.moduleName = rootParts.pop();
    registry.moduleNamespace = rootParts.pop();

    return registry;
}

function normalizeResult(result) {
    return { code: result.code || result, map: result.map || { mappings: "" } };
}

function getLwcEnginePath(mode) {
    const path = require.resolve('lwc-engine');
    const moduleTypeFolder = 'modules';
    const target = mode.includes('compat') ? 'es5' : 'es2017';

    return path
        .replace('commonjs', moduleTypeFolder)
        .replace('es2017', target);
}

function resolveRollupCompat({ mode, compat }) {
    if (mode === 'compat' || mode === 'prod_compat') {
        try {
            // We will compose compat plugin on top of this one (delegated)
            return require("rollup-plugin-compat").default(compat);
        } catch (e) {
            throw new Error(
                `Unable to compile resources for mode ${mode}` +
                `In order to use "compat" mode, you must include 'rollup-plugin-compat' as part of your dependencies`
            );
        }
    }
    // If we are not in compat, rollup becomes a noop
    // This just simplifies the logic bellow
    return {
        resolveId() { return undefined; },
        load() { return undefined; },
        knownCompatModule() { return false; },
        transform(src) { return src; },
        transformBundle(src) { return src; }
    };
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
    const { include, exclude } = pluginOptions;
    const filter = pluginUtils.createFilter(include, exclude);
    const mergedPluginOptions = Object.assign({}, DEFAULT_OPTIONS, pluginOptions);
    const { mode } = mergedPluginOptions;
    const rollupCompat = resolveRollupCompat(mergedPluginOptions);

    // Closure to store the resolved modules
    let modulePaths = {};

    return {
        name: "rollup-plugin-lwc-compiler",

        options(rollupOptions) {
            modulePaths = {};
            const entry = rollupOptions.input || rollupOptions.entry;
            const entryDir = mergedPluginOptions.rootDir || path.dirname(entry);
            const externalPaths = mergedPluginOptions.resolveFromPackages
                ? lwcResolver.resolveLwcNpmModules(mergedPluginOptions)
                : {};
            const sourcePaths = mergedPluginOptions.resolveFromSource
                ? lwcResolver.resolveModulesInDir(entryDir, mergedPluginOptions)
                : {};
            Object.assign(modulePaths, externalPaths, sourcePaths);
        },

        resolveId(importee, importer) {
            // lwc is special
            if (importee === LWC_ENGINE) {
                return getLwcEnginePath(mode);
            }

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
            return rollupCompat.resolveId(importee, importer);
        },

        load(id) {
            const exists = fs.existsSync(id);
            const isCSS = path.extname(id) === ".css";

            if (!exists && isCSS) {
                return "";
            }

            // Check if compat knows how to load this file
            return rollupCompat.load(id);
        },

        async transform(code, id) {
            // Filter user-land config and lwc import
            if (!filter(id) || id === getLwcEnginePath(mode)) {
                return;
            }

            // If we don't find the moduleId, just resolve the module name/namespace
            const moduleEntry = Object.values(modulePaths).find(r => id === r.entry);
            const moduleRegistry = moduleEntry || getModuleQualifiedName(id, mergedPluginOptions);

            let result = code;

            if (!rollupCompat.knownCompatModule(id)) {
                result = await compiler.transform(code, id, {
                    mode: DEFAULT_MODE, // Use always default mode since any other (prod or compat) will be resolved later
                    name: moduleRegistry.moduleName,
                    namespace: moduleRegistry.moduleNamespace,
                    moduleSpecifier: moduleRegistry.moduleSpecifier
                });
            }

            result = normalizeResult(result);

            if (mode === "compat" || mode === "prod_compat") {
                result = normalizeResult(
                    rollupCompat.transform(result.code, id)
                );
            }

            return { code: result.code, map: result.map };
        },

        transformBundle(code) {
            if (mode === "compat" || mode === "prod_compat") {
                code = rollupCompat.transformBundle(code);
            }

            let result;
            if (mode === "prod" || mode === "prod_compat") {
                const rollupReplace = replacePlugin({
                    "process.env.NODE_ENV": JSON.stringify("production")
                });
                const resultReplace = rollupReplace.transform(
                    code,
                    "$__tmpBundleSrc"
                );

                const transformConfig = {
                    babelrc: false,
                    sourceMaps: true,
                    parserOpts: { plugins: ["*"] },
                    presets: [[minify, { guards: false, evaluate: false }]],
                };

                const output = babel.transform(
                    resultReplace ? resultReplace.code : code,
                    transformConfig
                );

                result = output.code;
            }
            return result || code;
        }
    };
};
