// IMPORTANT: This file is used in both the node/setup environment and the browser/test environment

import { HIGHEST_API_VERSION } from '@lwc/shared';

// FIXME: Add jsdoc comments to each export explaining what it's used for

// --- Boolean test flags --- //

export const LEGACY_BROWSERS = Boolean(process.env.LEGACY_BROWSERS);

export const DISABLE_SYNTHETIC = Boolean(process.env.DISABLE_SYNTHETIC);

export const FORCE_NATIVE_SHADOW_MODE_FOR_TEST = Boolean(
    process.env.FORCE_NATIVE_SHADOW_MODE_FOR_TEST
);

export const ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL = Boolean(
    process.env.ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL
);

export const DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER = Boolean(
    process.env.DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER
);

export const DISABLE_STATIC_CONTENT_OPTIMIZATION = Boolean(
    process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION
);

export const ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION = Boolean(
    process.env.ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION
);

export const DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE = Boolean(
    process.env.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
);

export const ENGINE_SERVER = Boolean(process.env.ENGINE_SERVER);

// --- Test config --- //

export const API_VERSION = process.env.API_VERSION
    ? parseInt(process.env.API_VERSION, 10)
    : HIGHEST_API_VERSION;

export const NODE_ENV_FOR_TEST = process.env.NODE_ENV_FOR_TEST || 'development';

export const GREP = process.env.GREP;

export const NATIVE_SHADOW = DISABLE_SYNTHETIC || FORCE_NATIVE_SHADOW_MODE_FOR_TEST;

/** Unique directory name that encodes the flags that the tests were executed with. */
export const COVERAGE_DIR_FOR_OPTIONS =
    Object.entries({
        API_VERSION,
        DISABLE_STATIC_CONTENT_OPTIMIZATION,
        DISABLE_SYNTHETIC,
        DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
        ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL,
        ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION,
        FORCE_NATIVE_SHADOW_MODE_FOR_TEST,
        LEGACY_BROWSERS,
        NODE_ENV_FOR_TEST,
        DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE,
        ENGINE_SERVER,
    })
        .filter(([, val]) => val)
        .map(([key, val]) => `${key}=${val}`)
        .join('/') || 'no-options';

// --- CI config --- //

export const COVERAGE = Boolean(process.env.COVERAGE);
export const SAUCE_USERNAME = process.env.SAUCE_USERNAME;
export const SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY || process.env.SAUCE_KEY;
export const SAUCE_TUNNEL_ID = process.env.SAUCE_TUNNEL_ID;
export const IS_CI = Boolean(process.env.IS_CI);
export const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;
