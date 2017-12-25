/* eslint-env node */

const fs = require('fs');
const path = require('path');
const compiler = require('lwc-compiler');
const pluginUtils = require('rollup-pluginutils');
const lwcResolver = require('lwc-module-resolver');

const { DEFAULT_NS, DEFAULT_OPTIONS } = require('./constants');

function getModuleQualifiedName(file, { mapNamespaceFromPath }) {
    const registry = { entry: file, moduleSpecifier: null, moduleName: null, moduleNamespace: DEFAULT_NS };
    const fileName = path.basename(file, path.extname(file));
    const rootParts = path.dirname(file).split(path.sep);
    const nameParts = fileName.split('-');
    const validModuleName = nameParts.length > 1;

    if (mapNamespaceFromPath) {
        registry.moduleName = rootParts.pop();
        registry.moduleNamespace = rootParts.pop();
    } else if (validModuleName) {
        registry.moduleNamespace = nameParts.shift();
        registry.moduleName = nameParts.join('-');
    } else {
        registry.moduleName = fileName;
    }

    return registry;
}

module.exports = function rollupRaptorCompiler(opts = {}) {
    const filter = pluginUtils.createFilter(opts.include, opts.exclude);
    const options = Object.assign({}, DEFAULT_OPTIONS, opts, {
        mapNamespaceFromPath: Boolean(opts.mapNamespaceFromPath),
    });

    let modulePaths = {};

    return {
        name: 'rollup-lwc-compiler',
        options(opts) {
            const entry = opts.input || opts.entry;
            const entryDir = path.dirname(entry);
            const externalPaths = options.resolveFromPackages ? lwcResolver.resolveLwcNpmModules(options) : {};
            const sourcePaths = options.resolveFromSource ? lwcResolver.resolveModulesInDir(entryDir, options): {};
            modulePaths = Object.assign({}, externalPaths, sourcePaths);
        },

        resolveId(importee, importer) {
            // Resolve entry point if the import references a LWC module
            if (modulePaths[importee]) {
                return modulePaths[importee].entry;
            }

            // Normalize relative import to absolute import
            if (importee.startsWith('.') && importer) {
                const normalizedPath = path.resolve(path.dirname(importer), importee);
                return pluginUtils.addExtension(normalizedPath);
            }
        },

        load(id) {
            const exists = fs.existsSync(id);
            const isCSS = path.extname(id) === '.css';

            if (!exists && isCSS) {
                return '';
            }
        },

        transform(code, id) {
            if (!filter(id)) return;

            // If we don't find the moduleId, just resolve the module name/namespace
            let registry = Object.values(modulePaths).find(r => id === r.entry) || getModuleQualifiedName(id, options);
            return compiler.transform(code, id, {
                mode: options.mode,
                moduleName: registry.moduleName,
                moduleNamespace: registry.moduleNamespace,
                moduleSpecifier: registry.moduleSpecifier,
                resolveProxyCompat: { global: 'window.Proxy' }
            });
        },

        transformBundle(code) {
            return compiler.transformBundle(code, { mode: options.mode });
        }
    };
};
