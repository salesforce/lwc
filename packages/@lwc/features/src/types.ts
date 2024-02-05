/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * A feature flag can have three different values:
 * - `null`: The feature is **present** and **disabled** by default. It can be enabled at runtime.
 * - `true`: The feature is **present** and **enabled**. The flag is enabled in the generated output
 *           and can't be disabled at runtime.
 * - `false`: The feature is entirely **disabled**. The code behind the flag is stripped away from
 *            the generated output.
 */
export type FeatureFlagValue = boolean | null;

export interface FeatureFlagMap {
    /**
     * This is only used to test that feature flags are actually working
     */
    PLACEHOLDER_TEST_FLAG: FeatureFlagValue;

    /**
     * LWC engine flag to force native shadow mode for mixed shadow mode testing.
     */
    ENABLE_FORCE_NATIVE_SHADOW_MODE_FOR_TEST: FeatureFlagValue;

    /**
     * When true, disables native custom element lifecycle, even if the API version is high enough to support it.
     * This is designed as a temporary "kill switch."
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
}

export type FeatureFlagName = keyof FeatureFlagMap;
