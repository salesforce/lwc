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
    DUMMY_TEST_FLAG: FeatureFlagValue;

    /**
     * LWC engine flag to enable mixed shadow mode. Setting this flag to `true` enables usage of
     * native shadow DOM even when the synthetic shadow polyfill is applied.
     */
    ENABLE_MIXED_SHADOW_MODE: FeatureFlagValue;

    /**
     * LWC engine flag to make setter reactive.
     */
    ENABLE_REACTIVE_SETTER: FeatureFlagValue;

    /**
     * LWC engine flag to enable hot module replacement. It allows to exchange, component
     * definition, template and stylesheets at runtime without having to reload the entire
     * application.
     */
    ENABLE_HMR: FeatureFlagValue;

    /**
     * Synthetic shadow DOM flag to enable strict `HTMLElement.prototype.innerText` and
     * `HTMLElement.prototype.outerText` shadow dom semantic.
     */
    ENABLE_INNER_OUTER_TEXT_PATCH: FeatureFlagValue;

    /**
     * Synthetic shadow DOM flag to enable `Element.prototype` global patching. The following APIs
     * are affected by this flag:
     *  - `Element.prototype.innerHTML`
     *  - `Element.prototype.outerHTML`
     *  - `Element.prototype.innerText`
     *  - `Element.prototype.outerText`
     */
    ENABLE_ELEMENT_PATCH: FeatureFlagValue;

    /**
     * LWC engine flag to force native shadow mode for mixed shadow mode testing.
     */
    ENABLE_FORCE_NATIVE_SHADOW_MODE_FOR_TEST: FeatureFlagValue;

    /**
     * When enabled, we use the native custom element lifecycle hooks for callbacks such as
     * connectedCallback and disconnectedCallback, rather than a synthetic system based
     * on global DOM patching.
     */
    ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE: FeatureFlagValue;

    /**
     * Synthetic shadow DOM flag to enable `Node.prototype` global patching. The following APIs are
     * affected by this flag:
     *  - `Node.prototype.textContent`
     *  - `Node.prototype.contains`
     *  - `Node.prototype.cloneNode`
     */
    ENABLE_NODE_PATCH: FeatureFlagValue;

    /**
     * Synthetic shadow DOM flag to enable global patching to APIs returning a `NodeList`. The
     * following APIs are affected by this flag:
     *  - `Element.prototype.querySelector`
     *  - `Element.prototype.querySelectorAll`
     */
    ENABLE_NODE_LIST_PATCH: FeatureFlagValue;

    /**
     * Synthetic shadow DOM flag to enable global patching to APIs returning an `HTMLCollection`.
     * The following APIs are affected by this flag:
     *  - `Element.prototype.getElementsByClassName`
     *  - `Element.prototype.getElementsByTagName`
     *  - `Element.prototype.getElementsByTagNameNS`
     */
    ENABLE_HTML_COLLECTIONS_PATCH: FeatureFlagValue;

    /**
     * Flag to invoke the wire adapter update method right after the component is connected, instead
     * of next tick. It only affects wire configurations that depend on component values.
     */
    ENABLE_WIRE_SYNC_EMIT: FeatureFlagValue;
}

export type FeatureFlagName = keyof FeatureFlagMap;
