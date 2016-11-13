import * as babel from 'babel-core';

import templatePlugin from 'babel-plugin-transform-raptor-template';

const BASE_CONFIG = {
    babelrc: false,
    plugins: [ templatePlugin ],
    minified: true
};

export function compile (src, options = {}) {
    const result = babel.transform(src, {
        ...BASE_CONFIG,
        ...options
    });

    return result;
}
