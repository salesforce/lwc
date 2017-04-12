const compiler = require('raptor-compiler-core');
const path = require('path');
const glob = require('glob');

const {
    DEFAULT_NS,
    DEFAULT_OPTIONS,
} = require('./constants');

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
    const options = Object.assign(DEFAULT_OPTIONS, opts, {
        mapNamespaceFromPath: Boolean(opts.mapNamespaceFromPath),
    })

    let entry = null;
    let modulePaths = {};
    return {
        name: 'rollup-raptor-compiler',
        options({ entry: rollupEntry }) {
            entry = rollupEntry;
        },
        resolveId (importee, importer) {
            const isEntry = !importer;
            const isRelativeImport = importee[0] === '.';
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
            const compilerConfig = Object.assign({}, options, {
                sources: { [fileName]: code }
            });

            return compiler.compile(fileName, compilerConfig);
        }
    }
}
