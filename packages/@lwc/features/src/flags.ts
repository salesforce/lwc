/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export type FeatureFlagValue = boolean | null;
export type FeatureFlagLookup = { [name: string]: FeatureFlagValue };

const featureFlagLookup: FeatureFlagLookup = {
    ENABLE_REACTIVE_SETTER: null,
    ENABLE_HMR: null,
    // Flag to toggle on/off the enforcement of innerText/outerText shadow dom semantic in elements when using synthetic shadow.
    // Note: Elements outside the lwc boundary are controlled by the ENABLE_ELEMENT_PATCH flag.
    DISABLE_INNER_OUTER_TEXT_PATCH: null,
    // Flags to toggle on/off the enforcement of shadow dom semantic in element/node outside lwc boundary when using synthetic shadow.
    ENABLE_ELEMENT_PATCH: null,
    ENABLE_NODE_LIST_PATCH: null,
    ENABLE_HTML_COLLECTIONS_PATCH: null,
    ENABLE_NODE_PATCH: null,
};
export default featureFlagLookup;

export { runtimeFlags, setFeatureFlag, setFeatureFlagForTest } from './runtime';
