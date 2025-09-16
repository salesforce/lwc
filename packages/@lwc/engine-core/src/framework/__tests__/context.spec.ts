/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { setTrustedContextSet, setContextKeys } from '@lwc/shared';
import { logWarnOnce } from '../../shared/logger';
import { connectContext, disconnectContext } from '../modules/context';

// Mock the logger to inspect console output during tests
vi.mock('../../shared/logger', () => ({
    logWarnOnce: vi.fn(),
}));

// Create mock component with a regular, non-contextful property
const mockComponent = {};
Object.setPrototypeOf(mockComponent, {
    regularProp: 'not contextful',
});

// Create mock renderer
const mockRenderer = {
    registerContextProvider: vi.fn(),
};

// Create mock VM
const mockVM = {
    component: mockComponent,
    elm: null,
    renderer: mockRenderer,
} as any;

if (!(globalThis as any).lwcRuntimeFlags) {
    Object.defineProperty(globalThis, 'lwcRuntimeFlags', { value: {} });
}

/**
 * Need to be able to set and reset the flags at will (lwc/features doesn't provide this)
 */
const setFeatureFlag = (name: string, value: boolean) => {
    (globalThis as any).lwcRuntimeFlags[name] = value;
};

/**
 * These tests test that properties are correctly validated within the connectContext and disconnectContext
 * functions regardless of whether trusted context has been defined or not.
 * Integration tests have been used for extensive coverage of the LWC context feature, but this particular
 * scenario is best isolated and unit tested as it involves manipulation of the trusted context API.
 * See bug fix: #5492
 */
describe('context functions', () => {
    beforeAll(() => {
        const connectContext = Symbol('connectContext');
        const disconnectContext = Symbol('disconnectContext');
        setContextKeys({ connectContext, disconnectContext });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    afterAll(() => {
        setFeatureFlag('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', false);
    });

    describe('without setting trusted context', () => {
        it('should log a warning when trustedContext is not defined and connectContext is called with legacy signal context validation', () => {
            setFeatureFlag('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', true);
            connectContext(mockVM);
            expect(logWarnOnce).toHaveBeenCalledWith(
                'Attempted to connect to trusted context but received the following error: component[contextfulKeys[i]][connectContext2] is not a function'
            );
        });

        it('should not log a warning when trustedContext is not defined and connectContext is called with non-legacy context validation', () => {
            setFeatureFlag('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', false);
            connectContext(mockVM);
            expect(logWarnOnce).not.toHaveBeenCalled();
        });

        it('should log a warning when trustedContext is not defined and disconnectContext is called with legacy signal context validation', () => {
            setFeatureFlag('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', true);
            disconnectContext(mockVM);
            expect(logWarnOnce).toHaveBeenCalledWith(
                'Attempted to disconnect from trusted context but received the following error: component[contextfulKeys[i]][disconnectContext2] is not a function'
            );
        });

        it('should not log a warning when trustedContext is not defined and disconnectContext is called with non-legacy context validation', () => {
            setFeatureFlag('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', false);
            disconnectContext(mockVM);
            expect(logWarnOnce).not.toHaveBeenCalled();
        });
    });

    describe('with trusted context set', () => {
        it('should not log warnings when trustedContext is defined', () => {
            setTrustedContextSet(new WeakSet());
            setFeatureFlag('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', true);
            connectContext(mockVM);
            disconnectContext(mockVM);
            setFeatureFlag('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', false);
            expect(logWarnOnce).not.toHaveBeenCalled();
        });
    });
});
