/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export type FeatureFlagValue = boolean | null;
export type FeatureFlagName = keyof FeatureFlagMap;

export interface FeatureFlagMap {
    /**
     * TODO
     */
    ENABLE_REACTIVE_SETTER: FeatureFlagValue,

    /**
     * Enable hot module replacement. It allows to exchange, component definition, template and 
     * stylesheets at runtime without having to reload the entire application.
     */
    ENABLE_HMR: FeatureFlagValue,

    /**
     * Flag to toggle on/off the enforcement of innerText/outerText shadow dom semantic in elements when using synthetic shadow. 
     * Note: Once active, elements outside the lwc boundary are controlled by the 
     * ENABLE_ELEMENT_PATCH flag.
     */
    ENABLE_INNER_OUTER_TEXT_PATCH: FeatureFlagValue,

    /** 
     * Flags to toggle on/off the enforcement of shadow dom semantic in element/node outside lwc boundary when using synthetic shadow. 
     */
    ENABLE_ELEMENT_PATCH: FeatureFlagValue,

    ENABLE_NODE_LIST_PATCH: FeatureFlagValue,
    ENABLE_HTML_COLLECTIONS_PATCH: FeatureFlagValue,
    ENABLE_NODE_PATCH: FeatureFlagValue,

    /** 
     * Disables the fix for #2121 where non-composed events are visible outside of their shadow root. 
     */
    ENABLE_NON_COMPOSED_EVENTS_LEAKAGE: FeatureFlagValue,

    /**
     * Flag to toggle LWC light DOM support.
     */
    ENABLE_LIGHT_DOM_COMPONENTS: FeatureFlagValue,

    /**
     * Flag to toggle LWC mixed shadow DOM.
     */
    ENABLE_MIXED_SHADOW_MODE: FeatureFlagValue,
}


const featureFlagLookup: FeatureFlagMap = {
    ENABLE_REACTIVE_SETTER: null,
    ENABLE_HMR: null,
    ENABLE_INNER_OUTER_TEXT_PATCH: null,
    ENABLE_ELEMENT_PATCH: null,
    ENABLE_NODE_LIST_PATCH: null,
    ENABLE_HTML_COLLECTIONS_PATCH: null,
    ENABLE_NODE_PATCH: null,
    ENABLE_NON_COMPOSED_EVENTS_LEAKAGE: null,
    ENABLE_LIGHT_DOM_COMPONENTS: null,
    ENABLE_MIXED_SHADOW_MODE: null,
};

export default featureFlagLookup;
export { runtimeFlags, setFeatureFlag, setFeatureFlagForTest } from './runtime';
