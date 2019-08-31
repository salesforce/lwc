/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { create } from './shared/language';
import { FeatureFlag } from './flags';

interface FeatureFlagConfig {
    [flagName: string]: FeatureFlag;
}

const runtimeFlags: FeatureFlagConfig = create(null);

function setFeatureFlag(name: string, value: FeatureFlag) {
    runtimeFlags[name] = value;
}

export { runtimeFlags, setFeatureFlag };
