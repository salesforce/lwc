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
    ENABLE_ELEMENT_PATCH: null,
    ENABLE_FORCE_NATIVE_SHADOW_MODE_FOR_TEST: null,
    ENABLE_HMR: null,
    ENABLE_HTML_COLLECTIONS_PATCH: null,
    ENABLE_INNER_OUTER_TEXT_PATCH: null,
    ENABLE_MIXED_SHADOW_MODE: null,
    ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE: null,
    ENABLE_NODE_LIST_PATCH: null,
    ENABLE_NODE_PATCH: null,
    ENABLE_REACTIVE_SETTER: null,
    ENABLE_WIRE_SYNC_EMIT: null,
    ENABLE_LIGHT_GET_ROOT_NODE_PATCH: null,
    ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY: null,
};

if (!globalThis.lwcRuntimeFlags) {
    Object.defineProperty(globalThis, 'lwcRuntimeFlags', { value: create(null) });
}

export const lwcRuntimeFlags: Partial<FeatureFlagMap> = globalThis.lwcRuntimeFlags;

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
    if (process.env.NODE_ENV !== 'production') {
        // Allow the same flag to be set more than once outside of production to enable testing
        lwcRuntimeFlags[name] = value;
    } else {
        // Disallow the same flag to be set more than once in production
        const runtimeValue = lwcRuntimeFlags[name];
        if (!isUndefined(runtimeValue)) {
            // eslint-disable-next-line no-console
            console.error(
                `Failed to set the value "${value}" for the runtime feature flag "${name}". "${name}" has already been set with the value "${runtimeValue}".`
            );
            return;
        }
        defineProperty(lwcRuntimeFlags, name, { value });
    }
}

/**
 * Set the value at runtime of a given feature flag. This method should only be used for testing
 * purposes. It is a no-op when invoked in production mode.
 */
export function setFeatureFlagForTest(name: FeatureFlagName, value: FeatureFlagValue): void {
    if (process.env.NODE_ENV !== 'production') {
        setFeatureFlag(name, value);
    }
}

export const runtimeFlags = lwcRuntimeFlags; // backwards compatibility for before this was renamed

export default features;
