/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { FeatureFlag, FeatureFlagLookup } from './flags';
import { assert, create, isFalse, isTrue } from '@lwc/shared';

const runtimeFlags: FeatureFlagLookup = create(null);

// This function is not whitelisted for use within components and is meant for
// configuring runtime feature flags during app initialization.
function setFeatureFlag(name: string, value: FeatureFlag) {
    assert.invariant(
        isTrue(value) || isFalse(value),
        `Runtime feature flags must be set to a boolean value but received a(n) ${typeof value} value for the '${name}' flag.`
    );
    runtimeFlags[name] = value;
}

// This function is added to the LWC API whitelist (for testing purposes) so we
// add a check to make sure it is not invoked in production.
function setFeatureFlagForTest(name: string, value: FeatureFlag) {
    if (process.env.NODE_ENV !== 'production') {
        return setFeatureFlag(name, value);
    }
}

export { runtimeFlags, setFeatureFlag, setFeatureFlagForTest };
