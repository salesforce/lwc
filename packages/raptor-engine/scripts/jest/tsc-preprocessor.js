const tsc = require('typescript');

module.exports = {
    process(src, path) {
        if (path.endsWith('.js') || path.endsWith('.ts')) {
            const compiled = tsc.transpile(
                src,
                {},
                path,
                []
            );
            return compiled;
        }
        return src;
    },
};
