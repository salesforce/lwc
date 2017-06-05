import { transform, transformFromAst } from 'babel-core';
import { MODES, DEV_BABEL_CONFIG, PROD_BABEL_CONFIG, COMPAT_BABEL_CONFIG, MINIFY_CONFIG, PROD_COMPAT_BABEL_CONFIG } from './constants';
import { rollup } from 'rollup';

export default function(entry, bundle, options) {
    options = options || {};

    switch (options.mode) {
        case MODES.PROD:
            return transformBundle(entry, bundle, PROD_BABEL_CONFIG, options, 'minify');
        case MODES.COMPAT:
            return transformBundle(entry, bundle, COMPAT_BABEL_CONFIG, options);
        case MODES.PROD_COMPAT:
            return transformBundle(entry, bundle, PROD_COMPAT_BABEL_CONFIG, options, 'minify');
        case MODES.ALL:
            return Promise.all([
                transformBundle(entry, bundle, DEV_BABEL_CONFIG, options),
                transformBundle(entry, bundle, PROD_BABEL_CONFIG, options, 'minify'),
                transformBundle(entry, bundle, COMPAT_BABEL_CONFIG, options),
                transformBundle(entry, bundle, PROD_COMPAT_BABEL_CONFIG, options, 'minify'),
            ]).then((results) => ({ dev: results[0], prod: results[1], compat: results[2], prod_compat: results[3] }));

        default: return transformBundle(entry, bundle, DEV_BABEL_CONFIG, options);
    }
}

function transformBundle(entry, bundle, babelConfig, options, minify) {
    return rollup({
        entry,
        // Don't bail on imports, the imports get resolved during linking
        external(id) {
            return id !== entry
        },

        plugins: [{
            // Intercept the entry file online
            resolveId(id) {
                return id === entry ? bundle.code : null;
            },

            // Return the entry file content
            load: () => bundle.code,

            transform(src) {
                let result = transform(src, babelConfig);
                if (minify) {
                    result = transformFromAst(result.ast, result.code, MINIFY_CONFIG)
                }

                return { code : result.code, map  : result.map };
            }
        }],
    }).then(bundleResult => {
        const result = bundleResult.generate({
            format: options.format,
            moduleId: options.normalizedModuleName,
            interop: false,
            useStrict: false
        });

        result.metadata = bundle.metadata;
        return result;
    });

}
