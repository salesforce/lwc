const tsc = require('typescript');
const babel = require('babel-core');
const plugin = require('babel-plugin-transform-raptor-compat');
const tsJest = require('ts-jest/preprocessor.js');

function isTestFile(path) {
    return /tests/.test(path);
}

function transpile(src, path) {
    if (isTestFile(path)) {
        const { code } = babel.transform(src, {
            plugins: [
                [plugin, {
                    resolveProxyCompat: {
                        global: 'window.Proxy'
                    }
                }]
            ]
        });
        return code;
    }
    return src;
}

module.exports = {
    process(src, path, options, transpileOptions) {
        if (path.endsWith('.js') || path.endsWith('.ts')) {
            const code = tsJest.process(src, path, options, transpileOptions);
            return transpile(code, path);
        }
        return src;
    }
};
