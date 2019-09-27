/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export type FeatureFlag = boolean | null;
export type FeatureFlagLookup = { [name: string]: FeatureFlag };

const featureFlagLookup: FeatureFlagLookup = {
    ENABLE_FOO: true,
    ENABLE_BAR: false,
    ENABLE_REACTIVE_SETTER: null,
};
export default featureFlagLookup;

export const ENABLE_REACTIVE_SETTER: FeatureFlag = null;
export { runtimeFlags, setFeatureFlag, setFeatureFlagForTest } from './runtime';
