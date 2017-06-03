import babili from 'babel-preset-babili';
import { BABEL_PLUGINS_LATEST, BABEL_PLUGINS_COMPAT } from './babel-plugins';

export const MODES = {
    DEV: 'dev',
    PROD: 'prod',
    COMPAT: 'compat',
    PROD_COMPAT: 'prod_compat',
    ALL : 'all'
};

const BABILI_CONFIG = babili();

export const BASE_BABEL_CONFIG = {
    babelrc: false,
    sourceMaps: true,
    parserOpts: { plugins: ['*'] },
    presets: [],
};

export const DEV_BABEL_CONFIG = Object.assign(
    {},
    { plugins: BABEL_PLUGINS_LATEST },
    BASE_BABEL_CONFIG
);

export const PROD_BABEL_CONFIG = Object.assign(
    {},
    { plugins: BABEL_PLUGINS_LATEST },
    BASE_BABEL_CONFIG
);

export const COMPAT_BABEL_CONFIG = Object.assign(
    {},
    { plugins: BABEL_PLUGINS_COMPAT },
    BASE_BABEL_CONFIG
);

export const PROD_COMPAT_BABEL_CONFIG = Object.assign(
    {},
    { plugins: BABEL_PLUGINS_COMPAT },
    BASE_BABEL_CONFIG
);

export const MINIFY_CONFIG = Object.assign(
    {},
    BASE_BABEL_CONFIG,
    BABILI_CONFIG
)
