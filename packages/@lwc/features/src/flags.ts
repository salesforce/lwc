/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
type FeatureFlag = boolean | null;

// Initialize the global configuration object if it isn't initialized already.
const globalAny: any = global;
globalAny.LWC_config = globalAny.LWC_config || {};
globalAny.LWC_config.features = globalAny.LWC_config.features || {};

export const ENABLE_FOO: FeatureFlag = true;
export const ENABLE_BAR: FeatureFlag = false;
export const ENABLE_BAZ: FeatureFlag = null;
