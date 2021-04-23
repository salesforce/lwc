/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { create, isFalse, isTrue, isUndefined, globalThis } from '@lwc/shared';
import features, { FeatureFlagLookup, FeatureFlagValue } from './flags';

if (!globalThis.lwcRuntimeFlags) {
    Object.defineProperty(globalThis, 'lwcRuntimeFlags', { value: create(null) });
}

const runtimeFlags: FeatureFlagLookup = globalThis.lwcRuntimeFlags;

// This function is not supported for use within components and is meant for
// configuring runtime feature flags during app initialization.
function setFeatureFlag(name: string, value: FeatureFlagValue) {
    const isBoolean = isTrue(value) || isFalse(value);
    if (!isBoolean) {
        const message = `Failed to set the value "${value}" for the runtime feature flag "${name}". Runtime feature flags can only be set to a boolean value.`;
        if (process.env.NODE_ENV !== 'production') {
            throw new TypeError(message);
        } else {
            // eslint-disable-next-line no-console
            console.error(message);
            return;
        }
    }
    if (isUndefined(features[name])) {
        // eslint-disable-next-line no-console
        console.warn(
            `Failed to set the value "${value}" for the runtime feature flag "${name}" because it is undefined. Possible reasons are that 1) it was misspelled or 2) it was removed from the @lwc/features package.`
        );
        return;
    }
    if (process.env.NODE_ENV !== 'production') {
        // Allow the same flag to be set more than once outside of production to enable testing
        runtimeFlags[name] = value;
    } else {
        // Disallow the same flag to be set more than once in production
        const runtimeValue = runtimeFlags[name];
        if (!isUndefined(runtimeValue)) {
            // eslint-disable-next-line no-console
            console.error(
                `Failed to set the value "${value}" for the runtime feature flag "${name}". "${name}" has already been set with the value "${runtimeValue}".`
            );
            return;
        }
        Object.defineProperty(runtimeFlags, name, { value });
    }
}

// This function is exposed to components to facilitate testing so we add a
// check to make sure it is not invoked in production.
function setFeatureFlagForTest(name: string, value: FeatureFlagValue) {
    if (process.env.NODE_ENV !== 'production') {
        return setFeatureFlag(name, value);
    }
}

export { runtimeFlags, setFeatureFlag, setFeatureFlagForTest };
