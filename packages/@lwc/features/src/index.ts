/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { create, keys, defineProperty, isUndefined, isBoolean, globalThis } from '@lwc/shared';
import { FeatureFlagMap, FeatureFlagName, FeatureFlagValue } from './types';

const features: FeatureFlagMap = {
    DUMMY_TEST_FLAG: null,
    ENABLE_FORCE_NATIVE_SHADOW_MODE_FOR_TEST: null,
    ENABLE_MIXED_SHADOW_MODE: null,
    ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE: null,
    ENABLE_WIRE_SYNC_EMIT: null,
    DISABLE_LIGHT_DOM_UNSCOPED_CSS: null,
    ENABLE_FROZEN_TEMPLATE: null,
    DISABLE_ARIA_REFLECTION_POLYFILL: null,
    DISABLE_CUSTOM_ELEMENT_CONSTRUCTOR: null,
};

// eslint-disable-next-line no-restricted-properties
if (!globalThis.lwcRuntimeFlags) {
    Object.defineProperty(globalThis, 'lwcRuntimeFlags', { value: create(null) });
}

// eslint-disable-next-line no-restricted-properties
const flags: Partial<FeatureFlagMap> = globalThis.lwcRuntimeFlags;

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
        const availableFlags = keys(features)
            .map((name) => `"${name}"`)
            .join(', ');
        // eslint-disable-next-line no-console
        console.warn(
            `Failed to set the value "${value}" for the runtime feature flag "${name}" because it is undefined. Available flags: ${availableFlags}.`
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
