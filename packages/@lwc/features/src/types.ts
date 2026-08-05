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
     * If true, ignore `@lwc/synthetic-shadow` even if it's loaded on the page. Instead, run all components in
     * native shadow mode.
     */
    DISABLE_SYNTHETIC_SHADOW: FeatureFlagValue;

    /**
     * If true, the contents of stylesheet scope tokens are not validated.
     */
    DISABLE_SCOPE_TOKEN_VALIDATION: FeatureFlagValue;

    /**
     * If false or unset, use strict constructor validation.
     * If true, use legacy constructor check (reference equality only).
     */
    DISABLE_STRICT_VALIDATION: FeatureFlagValue;

    /**
     * If true, skips rehydration of DOM elements that are not connected.
     * Applies to rehydration performed while flushing the rehydration queue.
     */
    DISABLE_DETACHED_REHYDRATION: FeatureFlagValue;

    /**
     * If true, skips the guard that blocks native `attachShadow` on LWC component hosts that already use
     * synthetic shadow. When false or unset, the guard is active (default).
     */
    DISABLE_HOST_ATTACH_SHADOW_GUARD: FeatureFlagValue;

    /**
     * Controls how synthetic shadow exposes `ShadowRoot.getElementById`, which has no correct
     * shadow-scoped semantics and is therefore not emulated.
     *
     * When false or unset (default), it is exposed as a stub that throws when invoked — preserving
     * the long-standing behavior. Because a throwing stub is still a callable function, *value-based*
     * feature detection (`typeof root.getElementById === 'function'`, `if (root.getElementById)`,
     * `root.getElementById?.(id)`) reports it as present, so callers invoke it and hit the throw.
     *
     * When true, `getElementById` is exposed as `undefined` instead, so value-based feature detection
     * reveals its absence and callers can fall back to the supported, shadow-scoped
     * `querySelector('#' + id)`. This closes a real native-vs-synthetic divergence: native
     * `ShadowRoot` inherits a working `getElementById` from `DocumentFragment`, so feature-detecting
     * RUM/analytics libraries succeed in native shadow but throw in synthetic. This is a visible
     * change to a long-stable API used by every synthetic-shadow consumer, hence gated and off by
     * default.
     *
     * The flag affects `getElementById` only; the other unsupported `ShadowRoot` methods
     * (`getSelection`, `cloneNode`) are unrelated to it and remain plain throwing stubs.
     *
     * Note: `'getElementById' in root` stays `true` in both states by design — the own property is
     * what shadows the native `DocumentFragment.prototype.getElementById` (see @lwc/synthetic-shadow
     * shadow-root.ts). A caller that guards with `in` rather than a value check therefore still
     * enters the branch and, flag-on, throws a plain `TypeError` on the `undefined` value instead of
     * the descriptive `Disallowed method` error.
     */
    ENABLE_SHADOW_ROOT_UNDEFINED_METHODS: FeatureFlagValue;
}

export type FeatureFlagName = keyof FeatureFlagMap;
