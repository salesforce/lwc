/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { beforeEach, describe, it, expect, vi } from 'vitest';
import type { LightningElementConstructor } from '../base-lightning-element';
import type * as Mod from '../main';
import type * as LockerMod from '../locker-mode';

describe('legacy locker registry', () => {
    let m: typeof Mod;
    let isLockerModeComponent: typeof LockerMod.isLockerModeComponent;

    // The authority can be claimed only once per module instance, so load a fresh copy per test.
    beforeEach(async () => {
        vi.resetModules();
        m = await import('../main');
        ({ isLockerModeComponent } = await import('../locker-mode'));
    });

    it('registers component constructors given the authority', () => {
        class Cmp extends m.LightningElement {}
        const authority = m.enableLockerMode();
        expect(isLockerModeComponent(Cmp)).toBe(false);
        m.registerLockerModeComponent(Cmp, authority);
        expect(isLockerModeComponent(Cmp)).toBe(true);
    });

    it('allows the authority to be claimed only once', () => {
        m.enableLockerMode();
        expect(() => m.enableLockerMode()).toThrow(
            'Legacy Locker restriction can only be instantiated once.'
        );
    });

    it('rejects registration without the authority', () => {
        class Cmp extends m.LightningElement {}
        const authority = m.enableLockerMode();
        expect(authority).toBeTypeOf('symbol');
        expect(() => m.registerLockerModeComponent(Cmp, Symbol('forged'))).toThrow(
            'Cannot register a constructor without proper authority.'
        );
        expect(() => m.registerLockerModeComponent(Cmp, undefined as unknown as symbol)).toThrow(
            'Cannot register a constructor without proper authority.'
        );
        expect(isLockerModeComponent(Cmp)).toBe(false);
    });

    it('rejects registration before the authority is claimed, even with undefined', () => {
        class Cmp extends m.LightningElement {}
        expect(() => m.registerLockerModeComponent(Cmp, undefined as unknown as symbol)).toThrow(
            'Cannot register a constructor without proper authority.'
        );
    });

    it('rejects non-component constructors', () => {
        const authority = m.enableLockerMode();
        class NotCmp {}
        expect(() =>
            m.registerLockerModeComponent(
                NotCmp as unknown as LightningElementConstructor,
                authority
            )
        ).toThrow('Cannot register a non-component constructor.');
    });

    it('does not register subclasses implicitly', () => {
        const authority = m.enableLockerMode();
        class Parent extends m.LightningElement {}
        class Child extends Parent {}
        m.registerLockerModeComponent(Parent, authority);
        expect(isLockerModeComponent(Child)).toBe(false);
    });
});
