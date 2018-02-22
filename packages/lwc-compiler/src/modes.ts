import { OutputConfig } from './options';

/** Available compilation modes */
export const MODES = {
    DEV: "dev",
    PROD: "prod",
    COMPAT: "compat",
    PROD_COMPAT: "prod_compat"
};

/** List of all the modes */
export const ALL_MODES = [
    MODES.DEV,
    MODES.PROD,
    MODES.COMPAT,
    MODES.PROD_COMPAT
];

/**
 * Returns true if the passed mode is a PROD mode
 * @param {object} options
 */
export function isProd(options: OutputConfig) {
    if (!options) {
        return false;
    }
    return options.minify || (options.env && options.env.NODE_ENV === "prod");
}

/**
 * Returns true if the passed mode is a COMPAT mode
 * @param {object} options
 */

export function isCompat(options: OutputConfig) {
    if (!options) {
        return false;
    }
    return options.compat;
}
