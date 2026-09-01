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
     * Opt-in flag for W-23814957. When true, the static-content optimization
     * (`parseFragment` / `parseSVGFragment`) routes the exact markup it will assign to the
     * underlying `<template>.innerHTML` through the `sanitizeHtmlContent` hook — the same hook that
     * backs `lwc:inner-html` — before that markup becomes DOM, so both paths consult the hook
     * consistently. If false or unset (default), the markup is not routed through the hook and the
     * existing behavior is preserved.
     *
     * Only enable this in environments that install a `sanitizeHtmlContent` hook: when the flag is
     * on and no hook is installed, the default hook throws, which fails rendering of every static
     * fragment. The installed hook must also preserve the engine-generated scope tokens embedded in
     * the markup (or scoped styles break), and — because the SVG variant is processed with its
     * `<svg>` wrapper in place — must handle both HTML- and SVG-namespace fragments.
     */
    ENABLE_PARSE_FRAGMENT_SANITIZATION: FeatureFlagValue;

    /**
     * If true, the engine invokes a component's compiled template function through the intrinsic
     * `Reflect.apply` instead of `template.call(...)`. The `template.call(...)` form performs a
     * property lookup for `call` on the template function, which a component can shadow with an own
     * property; invoking via `Reflect.apply` uses the function's internal call behavior and ignores
     * any such own property. When false or unset (default), the prior `template.call(...)` invocation
     * is used.
     */
    ENABLE_INTRINSIC_TEMPLATE_INVOCATION: FeatureFlagValue;
}

export type FeatureFlagName = keyof FeatureFlagMap;
