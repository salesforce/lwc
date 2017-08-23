const tsc = require('typescript');
const babel = require('babel-core');
const plugin = require('babel-plugin-transform-raptor-compat');
const tscPreprocessor = require('./tsc-preprocessor');

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
                    global: 'window.Proxy'
                }
            }]
        ]
    });
    return code
}

module.exports = {
    process(src, path) {
        if (path.endsWith('.js') || path.endsWith('.ts')) {
            const tsc = tscPreprocessor.process(src, path);;
            return transpile(tsc, path);
        }
        return src;
    }
};
