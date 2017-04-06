import { transform } from 'babel-core';
import { MODES, DEV_BABEL_CONFIG, PROD_BABEL_CONFIG, COMPAT_BABEL_CONFIG } from './constants';

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
                dev    : transformBundle(bundle, DEV_BABEL_CONFIG),
                prod   : transformBundle(bundle, PROD_BABEL_CONFIG),
                compat : transformBundle(bundle, COMPAT_BABEL_CONFIG)
            };
        default: return transformBundle(bundle, DEV_BABEL_CONFIG);
    }
}
