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

    beforeEach(async () => {
        vi.resetModules();
        const contextModule = await import('../context');
        setContextKeys = contextModule.setContextKeys;
        getContextKeys = contextModule.getContextKeys;
    });

    it('should set and get context keys', () => {
        const mockContextKeys = {
            connectContext: Symbol('connect'),
            disconnectContext: Symbol('disconnect'),
            contextEventKey: Symbol('event'),
        };

        setContextKeys(mockContextKeys);
        const retrievedKeys = getContextKeys();

        expect(retrievedKeys).toBe(mockContextKeys);
        expect(retrievedKeys.connectContext).toBe(mockContextKeys.connectContext);
        expect(retrievedKeys.disconnectContext).toBe(mockContextKeys.disconnectContext);
        expect(retrievedKeys.contextEventKey).toBe(mockContextKeys.contextEventKey);
    });

    it('should throw when attempting to set context keys multiple times', () => {
        const mockContextKeys1 = {
            connectContext: Symbol('connect1'),
            disconnectContext: Symbol('disconnect1'),
            contextEventKey: Symbol('event1'),
        };

        const mockContextKeys2 = {
            connectContext: Symbol('connect2'),
            disconnectContext: Symbol('disconnect2'),
            contextEventKey: Symbol('event2'),
        };

        setContextKeys(mockContextKeys1);

        expect(() => {
            setContextKeys(mockContextKeys2);
        }).toThrow('`setContextKeys` cannot be called more than once');
    });

    it('should return undefined when getting context keys before setting them', () => {
        const keys = getContextKeys();
        expect(keys).toBeUndefined();
    });
});