/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, beforeEach, expect, it, vi } from 'vitest';

describe('signals', () => {
    let setTrustedSignalSet: (signals: WeakSet<object>) => void;
    let addTrustedSignal: (signal: object) => void;
    let isTrustedSignal: (target: object) => boolean;
    let legacyIsTrustedSignal: (target: object) => boolean;

    beforeEach(async () => {
        vi.resetModules();
        const signalsModule = await import('../signals');
        setTrustedSignalSet = signalsModule.setTrustedSignalSet;
        addTrustedSignal = signalsModule.addTrustedSignal;
        isTrustedSignal = signalsModule.isTrustedSignal;
        legacyIsTrustedSignal = signalsModule.legacyIsTrustedSignal;
    });

    describe('setTrustedSignalSet', () => {
        it('should throw an error if trustedSignals is already set', () => {
            setTrustedSignalSet(new WeakSet());
            expect(() => setTrustedSignalSet(new WeakSet())).toThrow(
                'Trusted Signal Set is already set!'
            );
        });
    });

    describe('addTrustedSignal', () => {
        it('should add a signal to the trustedSignals set', () => {
            const mockWeakSet = new WeakSet();
            setTrustedSignalSet(mockWeakSet);
            const signal = {};
            addTrustedSignal(signal);
            expect(isTrustedSignal(signal)).toBe(true);
        });
    });

    describe('isTrustedSignal', () => {
        it('should return true for a trusted signal', () => {
            const mockWeakSet = new WeakSet();
            setTrustedSignalSet(mockWeakSet);
            const signal = {};
            addTrustedSignal(signal);
            expect(isTrustedSignal(signal)).toBe(true);
        });

        it('should return false for an untrusted signal', () => {
            const mockWeakSet = new WeakSet();
            setTrustedSignalSet(mockWeakSet);
            expect(isTrustedSignal({})).toBe(false);
        });

        it('should return false for all calls when trustedSignals is not set', () => {
            expect(isTrustedSignal({})).toBe(false);
        });

        it('legacyIsTrustedSignal should return true when trustedSignals is not set', () => {
            expect(legacyIsTrustedSignal({})).toBe(true);
        });
    });
});
