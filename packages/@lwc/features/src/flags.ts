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
};
export default featureFlagLookup;

export { runtimeFlags, setFeatureFlag, setFeatureFlagForTest } from './runtime';
