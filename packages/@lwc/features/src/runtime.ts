/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import features, { FeatureFlagLookup, FeatureFlagValue } from './flags';
import { create, isFalse, isTrue, isUndefined } from '@lwc/shared';

const runtimeFlags: FeatureFlagLookup = create(null);

// This function is not whitelisted for use within components and is meant for
// configuring runtime feature flags during app initialization.
function setFeatureFlag(name: string, value: FeatureFlagValue) {
    const isBoolean = isTrue(value) || isFalse(value);
    if (!isBoolean) {
        const message = `Invalid ${typeof value} value specified for the "${name}" flag. Runtime feature flags can only be set to a boolean value.`;
        if (process.env.NODE_ENV === 'production') {
            console.error(message);
        } else {
            throw new TypeError(message);
        }
    }
    if (!isUndefined(features[name])) {
        runtimeFlags[name] = value;
    } else {
        console.warn(
            `LWC feature flag "${name}" is undefined. Possible reasons are that 1) it was misspelled or 2) it was removed from the @lwc/features package.`
        );
    }
}

// This function is added to the LWC API whitelist (for testing purposes) so we
// add a check to make sure it is not invoked in production.
function setFeatureFlagForTest(name: string, value: FeatureFlagValue) {
    if (process.env.NODE_ENV !== 'production') {
        if (isUndefined(features[name])) {
            throw new Error(
                `Feature flag "${name}" is undefined. Possible reasons are that 1) it was misspelled or 2) it was removed from the @lwc/features package.`
            );
        }
        return setFeatureFlag(name, value);
    }
}

export { runtimeFlags, setFeatureFlag, setFeatureFlagForTest };
