/* eslint-env node */
const compiler = require('raptor-compiler-core');
const path = require('path');
const glob = require("glob");
const DEFAULT_NS = 'x';

function initializePaths(opts) {
    const entry = opts.entry;
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

    opts.componentMapping = componentMapping;
    //console.log(opts);
}

function normalizeOptions(opts) {
    opts.mapNamespaceFromPath = !!opts.mapNamespaceFromPath;
    opts.bundle = opts.bundle !== undefined ? opts.bundle : false;
}

module.exports = (pluginOpts) => {
    pluginOpts || (pluginOpts = {});
    normalizeOptions(pluginOpts);

    const opts = Object.assign({}, pluginOpts); // create a local copy
    return {
        name: 'rollup-raptor-compiler',
        options(rollupOptions) {
            if (!opts.entry) {
                opts.entry = rollupOptions.entry;
                initializePaths(opts);
            }
        },
        resolveId (importee) {
            const id = opts.componentMapping[importee];
            if (id) { return id; }
        },
        transform (code, fileName) {
            return compiler.compile(fileName, Object.assign({}, pluginOpts, {
                sources: { [fileName]: code }
            }));
        }
    }
}
