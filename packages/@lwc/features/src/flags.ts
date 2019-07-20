/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
type FeatureFlag = boolean | null;

export const ENABLE_FOO: FeatureFlag = true;
export const ENABLE_BAR: FeatureFlag = false;
export const ENABLE_BAZ: FeatureFlag = null;
