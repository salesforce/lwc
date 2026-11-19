/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isComponentConstructor } from './def';
import type { LightningElementConstructor } from './base-lightning-element';

const lockerModeComponents = new WeakSet<LightningElementConstructor>();

let lockerModeSymbol: symbol | undefined;

/**
 * Claims the authority to register Legacy Locker constructors. Returns a private symbol that must
 * be passed to `registerLockerModeComponent`. Can only be called once, so the page must call it
 * before any component code runs; later callers (e.g. components) can't obtain the symbol.
 */
export function enableLockerMode(): symbol {
    if (lockerModeSymbol) {
        throw new Error('Legacy Locker restriction can only be instantiated once.');
    }
    lockerModeSymbol = Symbol('legacy Locker restriction');
    return lockerModeSymbol;
}

/**
 * Marks a component constructor as running in Legacy Locker.
 * Must be called before the first instance of the component is created.
 * @param Ctor
 * @param authority The symbol returned by `enableLockerMode`.
 */
export function registerLockerModeComponent(
    Ctor: LightningElementConstructor,
    authority: symbol
): void {
    if (!lockerModeSymbol || authority !== lockerModeSymbol) {
        throw new Error('Cannot register a constructor without proper authority.');
    }
    if (!isComponentConstructor(Ctor)) {
        throw new TypeError('Cannot register a non-component constructor.');
    }
    lockerModeComponents.add(Ctor);
}

/**
 * Returns true if the constructor was registered via `registerLockerModeComponent`.
 * @param Ctor
 */
export function isLockerModeComponent(Ctor: LightningElementConstructor): boolean {
    return lockerModeComponents.has(Ctor);
}
