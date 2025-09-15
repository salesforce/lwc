/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, beforeEach, expect, it, vi } from 'vitest';

describe('context', () => {
    let setContextKeys: (config: any) => void;
    let getContextKeys: () => any;
    let setTrustedContextSet: (signals: WeakSet<object>) => void;
    let addTrustedContext: (signal: object) => void;
    let isTrustedContext: (target: object) => boolean;
    let legacyIsTrustedContext: (target: object) => boolean;

    beforeEach(async () => {
        vi.resetModules();
        const contextModule = await import('../context');
        setContextKeys = contextModule.setContextKeys;
        getContextKeys = contextModule.getContextKeys;
        setTrustedContextSet = contextModule.setTrustedContextSet;
        addTrustedContext = contextModule.addTrustedContext;
        isTrustedContext = contextModule.isTrustedContext;
        legacyIsTrustedContext = contextModule.legacyIsTrustedContext;
    });

    it('should set and get context keys', () => {
        const mockContextKeys = {
            connectContext: Symbol('connect'),
            disconnectContext: Symbol('disconnect'),
        };

        setContextKeys(mockContextKeys);
        const retrievedKeys = getContextKeys();

        expect(retrievedKeys).toBe(mockContextKeys);
        expect(retrievedKeys.connectContext).toBe(mockContextKeys.connectContext);
        expect(retrievedKeys.disconnectContext).toBe(mockContextKeys.disconnectContext);
    });

    it('should throw when attempting to set context keys multiple times', () => {
        const mockContextKeys1 = {
            connectContext: Symbol('connect1'),
            disconnectContext: Symbol('disconnect1'),
        };

        const mockContextKeys2 = {
            connectContext: Symbol('connect2'),
            disconnectContext: Symbol('disconnect2'),
        };

        setContextKeys(mockContextKeys1);

        expect(() => {
            setContextKeys(mockContextKeys2);
        }).toThrow('`setContextKeys` cannot be called more than once');

        expect(getContextKeys()).toBe(mockContextKeys1);
    });

    it('should return undefined when getting context keys before setting them', () => {
        const keys = getContextKeys();
        expect(keys).toBeUndefined();
    });

    describe('setTrustedContextSet', () => {
        it('should throw an error if trustedContexts is already set', () => {
            setTrustedContextSet(new WeakSet());
            expect(() => setTrustedContextSet(new WeakSet())).toThrow(
                'Trusted Context Set is already set!'
            );
        });
    });

    describe('addTrustedContext', () => {
        it('should add a signal to the trustedContexts set', () => {
            const mockWeakSet = new WeakSet();
            setTrustedContextSet(mockWeakSet);
            const signal = {};
            addTrustedContext(signal);
            expect(isTrustedContext(signal)).toBe(true);
        });
    });

    describe('isTrustedContext', () => {
        it('should return true for a trusted context', () => {
            const mockWeakSet = new WeakSet();
            setTrustedContextSet(mockWeakSet);
            const signal = {};
            addTrustedContext(signal);
            expect(isTrustedContext(signal)).toBe(true);
        });

        it('should return false for an untrusted context', () => {
            const mockWeakSet = new WeakSet();
            setTrustedContextSet(mockWeakSet);
            expect(isTrustedContext({})).toBe(false);
        });

        it('should return false for all calls when trustedContexts is not set', () => {
            expect(isTrustedContext({})).toBe(false);
        });

        it('legacyIsTrustedContext should return true when trustedContexts is not set', () => {
            expect(legacyIsTrustedContext({})).toBe(true);
        });
    });
});
