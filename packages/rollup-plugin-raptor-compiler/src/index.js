/* eslint-env node */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const compiler = require('raptor-compiler');
const pluginUtils = require('rollup-pluginutils');
const raptorNpmResolver = require('raptor-npm-resolver');

const { DEFAULT_NS, DEFAULT_OPTIONS } = require('./constants');

function getSourceModulePaths(opts, entry) {
    const pathDir = path.dirname(entry);
    const pattern = pathDir + '/**/*.js';

    const mapping = {};

    glob.sync(pattern).forEach(file => {
        const rel = path.relative(pathDir, file);
        const parts = rel.split('/');
        const name = path.basename(parts.pop(), '.js');

        const cmpNs = opts.componentNamespace;
        let ns = cmpNs ? cmpNs : name.indexOf('-') === -1 ? DEFAULT_NS : null;

        let tmpNs = parts.pop();
        if (tmpNs === name) {
            tmpNs = parts.pop();
        }

        // If mapping folder structure override namespace
        if (opts.mapNamespaceFromPath) {
            ns = tmpNs === 'components' ? parts.pop() : tmpNs;
        }

        const mappingEntry = ns ? `${ns}-${name}` : name;
        const absoluteFile = path.resolve(process.cwd(), file);

        mapping[mappingEntry] = {
            name,
            namespace: ns,
            entry: absoluteFile,
            root: path.dirname(absoluteFile),
        }
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

                return id.startsWith(moduleDef.root);
            });

            if (moduleDefinition) {
                return compiler.transform(code, id, {
                    moduleName: moduleDefinition.name,
                    moduleNamespace: moduleDefinition.namespace
                });
            }
        },
    };
};
