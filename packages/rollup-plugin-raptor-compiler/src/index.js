/* eslint-env node */
const compiler = require('raptor-compiler-core');
const path = require('path');
var glob = require("glob");

function initializePaths(opts) {
    const entry = opts.entry;
    const pathDir = path.dirname(entry);
    const pattern = pathDir + '/**/*.js';

    const componentMapping = glob.sync(pattern).reduce((mapping, file) => {
        const rel = path.relative(pathDir, file);
        const parts = rel.split('/');
        const name = path.basename(parts.pop(), '.js');
        let ns = opts.componentNamespace;

        if (opts.mapNamespaceFromPath && parts.length > 2) {
            const tmpNs = parts.pop();
            ns = tmpNs === ns ? parts.pop() : tmpNs;
        }

        mapping[`${ns}:${name}`] = file;
        return mapping;
    }, {});

    opts.componentMapping = componentMapping;
}

function normalizeOptions(opts) {
    opts.componentNamespace = opts.componentNamespace || 'x';
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
