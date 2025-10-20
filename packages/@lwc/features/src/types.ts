/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * A feature flag can have three different values:
 * - `null`: The feature is **present** and **disabled** by default. It can be enabled at runtime.
 * - `true`: The feature is **present** and **enabled**. The flag is enabled in the generated output
 * and can't be disabled at runtime.
 * - `false`: The feature is entirely **disabled**. The code behind the flag is stripped away from
 * the generated output.
 */
export type FeatureFlagValue = boolean | null;

/**
 * Map of feature flags to whether each feature is enabled. Feature flags can be toggled to change
 * the behavior of LWC components.
 */
export interface FeatureFlagMap {
    /**
     * This is only used to test that feature flags are actually working
     * @internal
     */
    PLACEHOLDER_TEST_FLAG: FeatureFlagValue;

    /**
     * When true, disables native custom element lifecycle globally (i.e. uses synthetic custom element lifecycle).
     * When false, native custom element lifecycle is enabled globally.
     */
    DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE: FeatureFlagValue;

    /**
     * Flag to invoke the wire adapter update method right after the component is connected, instead
     * of next tick. It only affects wire configurations that depend on component values.
     */
    ENABLE_WIRE_SYNC_EMIT: FeatureFlagValue;

    /**
     * Disables unscoped CSS in Light DOM
     */
    DISABLE_LIGHT_DOM_UNSCOPED_CSS: FeatureFlagValue;

    /**
     * Flag to enable the "frozen template" feature. With this flag enabled, the template object
     * imported from HTML files is frozen and cannot be modified. E.g. this will throw:
     * ```js
     * import template from './template.html';
     * template.stylesheets = [];
     * ```
     */
    ENABLE_FROZEN_TEMPLATE: FeatureFlagValue;

    /**
     * If true, render legacy CSS scope tokens in addition to the modern CSS scope tokens. This is designed
     * for cases where backwards compat is required (e.g. global stylesheets using these tokens in their selectors).
     */
    // TODO [#3733]: remove support for legacy scope tokens
    ENABLE_LEGACY_SCOPE_TOKENS: FeatureFlagValue;
    /**
     * If true, enable experimental shadow DOM migration mode globally.
     */
    ENABLE_FORCE_SHADOW_MIGRATE_MODE: FeatureFlagValue;

    /**
     * EXPERIMENTAL FEATURE, DO NOT USE IN PRODUCTION
     * If true, allows the engine to expose reactivity to signals as describe in @lwc/signals.
     */
    ENABLE_EXPERIMENTAL_SIGNALS: FeatureFlagValue;

    /**
     * If true, legacy signal validation is used, where all component properties are considered signals or context
     * if a trustedSignalSet and trustedContextSet have not been provided via setTrustedSignalSet and setTrustedContextSet.
     * This is a killswitch for a bug fix: #5492
     */
    ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION: FeatureFlagValue;

    /**
     * If true, ignore `@lwc/synthetic-shadow` even if it's loaded on the page. Instead, run all components in
     * native shadow mode.
     */
    DISABLE_SYNTHETIC_SHADOW: FeatureFlagValue;

    /**
     * If true, the contents of stylesheet scope tokens are not validated.
     */
    DISABLE_SCOPE_TOKEN_VALIDATION: FeatureFlagValue;

    /**
     * If true, then lightning legacy locker is supported, otherwise lightning legacy locker will not function
     * properly.
     */
    LEGACY_LOCKER_ENABLED: FeatureFlagValue;

    /**
     * A manual override for `LEGACY_LOCKER_ENABLED`; should not be used if that flag is correctly set.
     * If true, behave as if legacy Locker is enabled.
     * If false or unset, then the value of the `LEGACY_LOCKER_ENABLED` flag is used.
     */
    DISABLE_LEGACY_VALIDATION: FeatureFlagValue;

    /**
     * If true, enables legacy context connection and disconnection which can result in the component lifecycle
     * observing properties that are not typically observed. ENABLE_EXPERIMENTAL_SIGNALS must also be enabled for
     * this flag to have an effect. See PR #5536 for more information.
     */
    ENABLE_LEGACY_CONTEXT_CONNECTION: FeatureFlagValue;
}

export type FeatureFlagName = keyof FeatureFlagMap;
