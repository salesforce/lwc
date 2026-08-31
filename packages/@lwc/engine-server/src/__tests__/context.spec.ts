/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, it, expect, vi } from 'vitest';
import { registerContextProvider } from '../context';
import { HostContextProvidersKey } from '../types';
import type { HostElement } from '../types';

function mockHostElement(): HostElement {
    return { [HostContextProvidersKey]: new Map() } as HostElement;
}

describe('registerContextProvider', () => {
    it('registers the subscription callback under the adapter token', () => {
        const elm = mockHostElement();
        const onContextSubscription = vi.fn();

        registerContextProvider(elm, 'token', onContextSubscription);

        expect(elm[HostContextProvidersKey].get('token')).toBe(onContextSubscription);
    });

    it('returns an unregister callback that removes the registration', () => {
        const elm = mockHostElement();
        const onContextSubscription = vi.fn();

        const unregister = registerContextProvider(elm, 'token', onContextSubscription);
        unregister();

        expect(elm[HostContextProvidersKey].has('token')).toBe(false);
    });

    it('unregister is a no-op once a newer registration has replaced it', () => {
        const elm = mockHostElement();
        const first = vi.fn();
        const second = vi.fn();

        const unregisterFirst = registerContextProvider(elm, 'token', first);
        registerContextProvider(elm, 'token', second);
        // Stale unregister must not evict the newer provider.
        unregisterFirst();

        expect(elm[HostContextProvidersKey].get('token')).toBe(second);
    });
});
