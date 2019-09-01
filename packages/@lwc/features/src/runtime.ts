/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { FeatureFlag } from './flags';
import assert from './shared/assert';
import { create, isFalse, isTrue } from './shared/language';

interface FeatureFlagConfig {
    [name: string]: FeatureFlag;
}

const runtimeFlags: FeatureFlagConfig = create(null);

function setFeatureFlag(name: string, value: FeatureFlag) {
    assert.invariant(
        isTrue(value) || isFalse(value),
        `Runtime feature flags must be set to a boolean value but received a(n) ${typeof value} value for the '${name}' flag.`
    );
    runtimeFlags[name] = value;
}

function setFeatureFlagForTest(name: string, value: FeatureFlag) {
    if (process.env.NODE_ENV === 'production') {
        // this method must not leak to production
        throw new ReferenceError();
    }
    return setFeatureFlag(name, value);
}

export { runtimeFlags, setFeatureFlag, setFeatureFlagForTest };
