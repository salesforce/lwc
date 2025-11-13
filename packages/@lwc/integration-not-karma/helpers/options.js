// IMPORTANT: This file is used in both the node/setup environment and the browser/test environment

import { HIGHEST_API_VERSION } from '@lwc/shared';

// --- Boolean test flags --- //

/** Run SauceLabs tests using only "legacy" browsers. */
export const LEGACY_BROWSERS = Boolean(process.env.LEGACY_BROWSERS);

/** Force tests to run in native shadow mode with synthetic shadow polyfill patches. */
export const FORCE_NATIVE_SHADOW_MODE_FOR_TEST = Boolean(
    process.env.FORCE_NATIVE_SHADOW_MODE_FOR_TEST
);

/** Enable ARIA string reflection as a global polyfill. */
export const ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL = Boolean(
    process.env.ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL
);

/** Disable synthetic shadow support at the compiler level. */
export const DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER = Boolean(
    process.env.DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER
);

/** Set the compiler flag to disable static content optimization. */
export const DISABLE_STATIC_CONTENT_OPTIMIZATION = Boolean(
    process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION
);

/** Set the runtime flag to use the synthetic custom element lifecycle instead of native. */
export const DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE = Boolean(
    process.env.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
);

/** Disable detached rehydation. I don't know what that means. */
export const DISABLE_DETACHED_REHYDRATION = Boolean(process.env.DISABLE_DETACHED_REHYDRATION);

/** Run hydration tests using `@lwc/engine-server` instead of SSR v2. */
export const ENGINE_SERVER = Boolean(process.env.ENGINE_SERVER);

// --- Test config --- //

/**
 * Integration tests default to synthetic shadow mode, while hydration tests default to native.
 * This should be set to "native" or "synthetic" to override the default mode.
 * @type {'native'|'synthetic'|undefined}
 */
// NOTE: NATIVE_SHADOW is not defined here because integration/hydration have different defaults
export const SHADOW_MODE_OVERRIDE = process.env.SHADOW_MODE_OVERRIDE;

/** The API version to use for compiling and rendering components. */
export const API_VERSION = process.env.API_VERSION
    ? parseInt(process.env.API_VERSION, 10)
    : HIGHEST_API_VERSION;

/** The `NODE_ENV` to set for tests (at runtime, in the browser). */
export const NODE_ENV_FOR_TEST = process.env.NODE_ENV_FOR_TEST || 'development';

/** Unique directory name that encodes the flags that the tests were executed with. */
export const COVERAGE_DIR_FOR_OPTIONS =
    Object.entries({
        API_VERSION,
        DISABLE_STATIC_CONTENT_OPTIMIZATION,
        SHADOW_MODE_OVERRIDE,
        DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
        ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL,
        FORCE_NATIVE_SHADOW_MODE_FOR_TEST,
        LEGACY_BROWSERS,
        NODE_ENV_FOR_TEST,
        DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE,
        ENGINE_SERVER,
        DISABLE_DETACHED_REHYDRATION,
    })
        .filter(([, val]) => val)
        .map(([key, val]) => `${key}=${val}`)
        .join('/') || 'no-options';

// --- CI config --- //

/** Whether or not to report coverage. Currently unused. */
export const COVERAGE = Boolean(process.env.COVERAGE);
/** Whether or not we're running in CI. */
export const CI = Boolean(process.env.CI);
/** The GitHub Actions run ID, set by GitHub. */
export const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;

// --- SauceLabs config --- //

// We used to use SauceLabs for cross-platform testing in CI. Now we use GitHub Actions,
// but we've kept the SauceLabs config in place in case we ever need it for local testing.
// (Requires some local setup, see docs: https://docs.saucelabs.com/secure-connections/sauce-connect-5/quickstart/)

/** Whether we should use SauceLabs runners or not. */
export const USE_SAUCE = Boolean(process.env.USE_SAUCE);
export const {
    /** SauceLabs username. */
    SAUCE_USERNAME,
    /** SauceLabs access key. */
    SAUCE_ACCESS_KEY,
    /** SauceLabs tunnel ID. */
    SAUCE_TUNNEL_ID,
} = process.env;
