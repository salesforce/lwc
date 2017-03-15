import { transform } from 'babel-core';
import { MODES } from './constants';

const BASE_BABEL_CONFIG = {
    babelrc: false,
    sourceMaps: true,
    parserOpts: { plugins: ['*'] },
    presets: []
};

const PROD_BABEL_CONFIG = Object.assign({}, BASE_BABEL_CONFIG, {
    presets: ['babili']
});

const COMPAT_BABEL_CONFIG = Object.assign({}, BASE_BABEL_CONFIG, {
    presets: [
        'babili',
        ["env", { "targets": { "ie": 11 } }]
    ]
});

function transformBundle(bundle, config) {
    const result = transform(bundle.code, config);
    return {
        code     : result.code,
        map      : result.map,
        metadata : bundle.metadata
    };
}

export default function(bundle: any, options: any) {
    options = options || {};

    switch (options.mode) {
        case MODES.PROD:
            return transformBundle(bundle, PROD_BABEL_CONFIG);
        case MODES.COMPAT:
            return transformBundle(bundle, COMPAT_BABEL_CONFIG);
        case MODES.ALL:
            return {
                dev    : bundle,
                prod   : transformBundle(bundle, COMPAT_BABEL_CONFIG),
                compat : transformBundle(bundle, PROD_BABEL_CONFIG)
            };
        default: return bundle;
    }
}
