/* eslint-env node */
const compiler = require('raptor-compiler');
const pluginUtils = require('rollup-pluginutils');
const path = require('path');
const glob = require('glob');
const { DEFAULT_NS, DEFAULT_OPTIONS } = require('./constants');
const raptorNpmResolver = require('raptor-npm-resolver');

function getSourceModulePaths(opts, entry) {
    const pathDir = path.dirname(entry);
    const pattern = pathDir + '/**/*.js';

    return glob.sync(pattern).reduce((mapping, file) => {
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

        const resolvedName = ns ? `${ns}-${name}` : name;
        mapping[resolvedName] = file;

        return mapping;
    }, {});
}

module.exports = function rollupRaptorCompiler(opts = {}) {
    const filter = pluginUtils.createFilter(opts.include, opts.exclude);

    const options = Object.assign({}, DEFAULT_OPTIONS, opts, {
        mapNamespaceFromPath: Boolean(opts.mapNamespaceFromPath),
    })

    let modulePaths = {}; // Closure to store the module mapping

    return {
        name: 'rollup-raptor-compiler',
        options({ entry }) {
            const externalPaths = options.resolveFromPackages ?  raptorNpmResolver() : {};
            const sourcePaths = options.resolveFromSource ? getSourceModulePaths(opts, entry) : {};
            modulePaths = Object.assign({}, externalPaths, sourcePaths);
        },

        resolveId(importee, importer) {
            const isEntry = !importer;
            const isRelativeImport = importee[0] === '.';

            if (isEntry || isRelativeImport) {
                return;
            }

            return modulePaths[importee];
        },
        transform (code, fileName) {
            if (!filter(fileName)) return;

            const compilerConfig = Object.assign({}, options, {
                sources: { [fileName]: code }
            });

            return compiler.compile(fileName, compilerConfig);
        }
    }
}
