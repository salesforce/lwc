/** Available compilation modes */
export const MODES = {
    DEV: 'dev',
    PROD: 'prod',
    COMPAT: 'compat',
    PROD_COMPAT: 'prod_compat',
};

/** List of all the modes */
export const ALL_MODES = [
    MODES.DEV,
    MODES.PROD,
    MODES.COMPAT,
    MODES.PROD_COMPAT,
];

/**
 * Returns true if the passed mode is a PROD mode
 * @param {string} mode
 */
export function isProd(mode) {
    return mode === MODES.PROD || mode === MODES.PROD_COMPAT;
}

/**
 * Returns true if the passed mode is a COMPAT mode
 * @param {string} mode
 */
export function isCompat(mode) {
    return mode === MODES.COMPAT || mode === MODES.PROD_COMPAT;
}
