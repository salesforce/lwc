const compiler = require('raptor-compiler-core');
const pluginUtils = require('rollup-pluginutils');
const path = require('path');
const glob = require('glob');
const { DEFAULT_NS, DEFAULT_OPTIONS } = require('./constants');

function resolveEnginePath() {
    return require.resolve('raptor-engine').replace('raptor.js', 'raptor.es.js');
}

function getModulePaths(opts, entry) {
    const pathDir = path.dirname(entry);
    const pattern = pathDir + '/**/*.js';

    const componentMapping = glob.sync(pattern).reduce((mapping, file) => {
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

    return componentMapping;
}

module.exports = function rollupRaptorCompiler(opts = {}) {
    const filter = pluginUtils.createFilter(opts.include, opts.exclude);

    const options = Object.assign({}, DEFAULT_OPTIONS, opts, {
        mapNamespaceFromPath: Boolean(opts.mapNamespaceFromPath),
    })

    let entry = null;
    let modulePaths = {};
    let resolveEngine;
    return {
        name: 'rollup-raptor-compiler',
        options({ entry: rollupEntry, resolveEngine: resolveEngineResource }) {
            entry = rollupEntry;
            resolveEngine = resolveEngineResource === false ? false : options.resolveEngine;
        },

        resolveId (importee, importer) {
            const isEntry = !importer;
            const isRelativeImport = importee[0] === '.';

            if (resolveEngine && importee === 'engine') {
                return resolveEnginePath();
            }

            if (isEntry || isRelativeImport) {
                return;
            }

            const isPathCached = importee in modulePaths;
            if (!isPathCached) {
                modulePaths = getModulePaths(opts, entry);
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
