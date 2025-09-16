/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, it, expect, vi, afterEach, beforeEach, afterAll, beforeAll } from 'vitest';
import { setTrustedSignalSet } from '@lwc/shared';
import { setFeatureFlagForTest } from '@lwc/features';
import { componentValueObserved } from '../../framework/mutation-tracker';

// Create a mock VM object with required properties
const mockVM = {
    component: {},
    tro: {
        isObserving: () => true,
    },
} as any;

/**
 * These tests check that properties are correctly validated within the mutation-tracker
 * regardless of whether trusted context has been defined by a state manager or not.
 * Integration tests have been used for extensive coverage of the LWC signals feature, but this particular
 * scenario is best isolated and unit tested as it involves manipulation of the trusted context API.
 */
describe('mutation-tracker', () => {
    it('should not throw when componentValueObserved is called using the new signals validation and no signal set is defined', () => {
        setFeatureFlagForTest('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', false);
        expect(() => {
            componentValueObserved(mockVM, 'testKey', {});
        }).not.toThrow();
    });

    it('should throw when componentValueObserved is called using legacy signals validation and no signal set has been defined', () => {
        setFeatureFlagForTest('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', true);
        expect(() => {
            componentValueObserved(mockVM, 'testKey', {});
        }).toThrow();
    });

    it('should not throw when a trusted signal set is defined abd componentValueObserved is called', () => {
        setTrustedSignalSet(new WeakSet());

        setFeatureFlagForTest('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', false);
        expect(() => {
            componentValueObserved(mockVM, 'testKey', {});
        }).not.toThrow();

        setFeatureFlagForTest('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', true);
        expect(() => {
            componentValueObserved(mockVM, 'testKey', {});
        }).not.toThrow();
    });

    beforeAll(() => {
        setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', true);
    });

    afterAll(() => {
        setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', false);
        setFeatureFlagForTest('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', false);
    });

    beforeEach(() => {
        vi.stubEnv('IS_BROWSER', 'true'); // Signals is a browser-only feature
    });

    afterEach(() => {
        vi.unstubAllEnvs(); // Reset environment variables after each test
    });
});
