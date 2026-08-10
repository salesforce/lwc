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
     * If true, skips the guard that blocks direct invocation of the publicly-exported `rendererFactory`.
     * When false or unset (default), the guard is active and calling `rendererFactory(...)` throws. The
     * factory is only meant to be `toString`-ed and recreated inside a sandbox by libraries such as
     * Lightning Web Security; invoking the privileged export directly builds a renderer whose raw DOM
     * access runs in the host realm, which is not a supported use. Toggling this on restores the pre-fix
     * behavior for legacy integrations that relied on invoking the export.
     */
    DISABLE_RENDERER_FACTORY_INVOCATION_GUARD: FeatureFlagValue;

    /**
     * If true, the synthetic-shadow `NodeList`/`HTMLCollection` `item` method skips the receiver
     * check and returns `this[index]` for any receiver, as it did prior to 266.
     */
    // Remove in 270
    ENABLE_LEGACY_ITEM_POLYFILL: FeatureFlagValue;

    /**
     * If true, synthetic shadow exposes the unemulated `ShadowRoot.getElementById` as `undefined`
     * so value-based feature detection falls back to `querySelector`. If false or unset (default),
     * it stays a stub that throws when invoked.
     */
    // Remove in 270
    ENABLE_SHADOW_ROOT_UNDEFINED_GET_ELEMENT_BY_ID: FeatureFlagValue;

    /**
     * If true, the synthetic-shadow `HTMLCollection.namedItem` method always inspects the
     * out-of-bounds `items[length]` slot instead of the current index, reproducing the broken
     * lookup behavior it had prior to 266. If false or unset (default), it iterates items correctly.
     */
    // Remove in 270
    ENABLE_BROKEN_HTML_COLLECTION_NAMED_ITEM: FeatureFlagValue;

    /**
     * If true, disables the check in `hydrateComponent(element)` that `element` is a custom element.
     */
    // Remove in 270
    DISABLE_HYDRATION_CUSTOM_ELEMENT_CHECK: FeatureFlagValue;
}

export type FeatureFlagName = keyof FeatureFlagMap;
