const tsc = require('typescript');
const babel = require('babel-core');
const plugin = require('babel-plugin-transform-raptor-compat');
const tsJest = require('ts-jest/preprocessor.js');

function isTestFile(path) {
    return /__tests__/.test(path) || /expect-compat-extensions/.test(path);
}

function transpile(src, path) {
    if (!isTestFile(path)) {
        return src;
    }
    const { code } = babel.transform(src, {
        plugins: [
            [plugin, {
                resolveProxyCompat: {
                    global: 'window.Proxy = require("proxy-compat")'
                }
            }]
        ]
    });
    return code
}

module.exports = {
    process(src, path, config, transpileConfig) {
        if (path.endsWith('.js') || path.endsWith('.ts')) {
            const tsc = tsJest.process(src, path, config, transpileConfig);
            return transpile(tsc, path);
        }
        return src;
    }
};
