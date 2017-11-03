/* eslint-env node */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const compiler = require('raptor-compiler');
const pluginUtils = require('rollup-pluginutils');
const raptorNpmResolver = require('raptor-npm-resolver');

const { DEFAULT_NS, DEFAULT_OPTIONS } = require('./constants');

function getModuleQualifiedName(file, opts) {
    const parts = file.split('/');
    const ext = path.extname(file);
    let name = path.basename(parts.pop(), ext);
    const nameParts = name.split('-');
    const noNamespace = nameParts.length === 1;
    let ns;

    // If mapping folder structure override namespace
    if (opts.mapNamespaceFromPath) {
        ns = parts.pop();
    } else if (noNamespace) {
        ns = DEFAULT_NS;
    } else {
        ns = nameParts.shift();
        name = nameParts.join('-');
    }

    const mappingEntry = `${ns}-${name}`;
    const absoluteFile = path.resolve(process.cwd(), file);
    const root = path.dirname(absoluteFile);

    return {
        name,
        namespace: ns,
        fullName: mappingEntry,
        entry: absoluteFile,
        root
    };

}

function getSourceModulePaths(opts, entry) {
    const pathDir = path.dirname(entry);
    const pattern = pathDir + '/**/*.js';
    const mapping = {};

    glob.sync(pattern).forEach(file => {
        const moduleRegistry = getModuleQualifiedName(file, opts);
        mapping[moduleRegistry.fullName] = moduleRegistry;
    });

    return mapping;
}

module.exports = function rollupRaptorCompiler(opts = {}) {
    const filter = pluginUtils.createFilter(opts.include, opts.exclude);

    const options = Object.assign({}, DEFAULT_OPTIONS, opts, {
        mapNamespaceFromPath: Boolean(opts.mapNamespaceFromPath),
    });

    let modulePaths = {};

    return {
        name: 'rollup-raptor-compiler',

        options({ entry }) {
            const externalPaths = options.resolveFromPackages
                ? raptorNpmResolver()
                : {};
            const sourcePaths = options.resolveFromSource
                ? getSourceModulePaths(opts, entry)
                : {};

            modulePaths = Object.assign({}, externalPaths, sourcePaths);
        },

        resolveId(importee, importer) {
            // Resolve entry point if the import references a raptor module
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

            // Resolve module definition
            const moduleDefinition = Object.values(modulePaths).find(moduleDef => {
                if (!moduleDef.root) {
                    return;
                }
                return id.startsWith(moduleDef.entry);
            }) || getModuleQualifiedName(id, opts);

            return compiler.transform(code, id, {
                moduleName: moduleDefinition.name,
                moduleNamespace: moduleDefinition.namespace,
            });
        },
    };
};
