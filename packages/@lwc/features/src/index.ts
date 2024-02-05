/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { create, defineProperty, isUndefined, isBoolean } from '@lwc/shared';
import { FeatureFlagMap, FeatureFlagName, FeatureFlagValue } from './types';

// When deprecating a feature flag, ensure that it is also no longer set in the application. For
// example, in core, the flag should be removed from LwcPermAndPrefUtilImpl.java
const features: FeatureFlagMap = {
    PLACEHOLDER_TEST_FLAG: null,
    ENABLE_FORCE_NATIVE_SHADOW_MODE_FOR_TEST: null,
    DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE: null,
    ENABLE_WIRE_SYNC_EMIT: null,
    DISABLE_LIGHT_DOM_UNSCOPED_CSS: null,
    ENABLE_FROZEN_TEMPLATE: null,
    ENABLE_LEGACY_SCOPE_TOKENS: null,
    ENABLE_FORCE_SHADOW_MIGRATE_MODE: null,
};

if (!(globalThis as any).lwcRuntimeFlags) {
    Object.defineProperty(globalThis, 'lwcRuntimeFlags', { value: create(null) });
}

const flags: Partial<FeatureFlagMap> = (globalThis as any).lwcRuntimeFlags;

/**
 * Set the value at runtime of a given feature flag. This method only be invoked once per feature
 * flag. It is meant to be used during the app initialization.
 */
export function setFeatureFlag(name: FeatureFlagName, value: FeatureFlagValue): void {
    if (!isBoolean(value)) {
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
        console.info(
            `Attempt to set a value on an unknown feature flag "${name}" resulted in a NOOP.`
        );
        return;
    }
    // This may seem redundant, but `process.env.NODE_ENV === 'test-karma-lwc'` is replaced by Karma tests
    if (process.env.NODE_ENV === 'test-karma-lwc' || process.env.NODE_ENV !== 'production') {
        // Allow the same flag to be set more than once outside of production to enable testing
        flags[name] = value;
    } else {
        // Disallow the same flag to be set more than once in production
        const runtimeValue = flags[name];
        if (!isUndefined(runtimeValue)) {
            // eslint-disable-next-line no-console
            console.error(
                `Failed to set the value "${value}" for the runtime feature flag "${name}". "${name}" has already been set with the value "${runtimeValue}".`
            );
            return;
        }
        defineProperty(flags, name, { value });
    }
}

/**
 * Set the value at runtime of a given feature flag. This method should only be used for testing
 * purposes. It is a no-op when invoked in production mode.
 */
export function setFeatureFlagForTest(name: FeatureFlagName, value: FeatureFlagValue): void {
    // This may seem redundant, but `process.env.NODE_ENV === 'test-karma-lwc'` is replaced by Karma tests
    if (process.env.NODE_ENV === 'test-karma-lwc' || process.env.NODE_ENV !== 'production') {
        setFeatureFlag(name, value);
    }
}

export default features;

export {
    flags as runtimeFlags, // backwards compatibility for before this was renamed
    flags as lwcRuntimeFlags,
};

export type { FeatureFlagMap };

declare global {
    const lwcRuntimeFlags: Partial<FeatureFlagMap>;
}
