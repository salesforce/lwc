/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { LightningElementConstructor } from './lightning-element';

interface PublicPropertiesHolder {
    __lwcPublicProperties__?: Set<string>;
}

/**
 * Union of a class's own `@api` names with its immediate superclass's already-resolved allowlist.
 * Stored back on each class, so this one-level union chains transitively up the prototype chain —
 * resolving the actual (incl. dynamically-chosen) superclass the compiler can't see.
 */
export function resolvePublicProperties(
    Component: LightningElementConstructor,
    ownPublicProps: string[]
): Set<string> {
    const SuperClass: PublicPropertiesHolder = Object.getPrototypeOf(Component);
    const superPublicProps = SuperClass.__lwcPublicProperties__ ?? [];
    return new Set([...ownPublicProps, ...superPublicProps]);
}

/**
 * Attach the resolved allowlist to a class, without the rest of `setStaticInternals`
 * (generate-markup, default template, wire adapters). The compiler emits a full
 * `setStaticInternals` only for the exported component; this gives non-exported in-file base
 * classes their own `__lwcPublicProperties__` so the runtime union folds them in (W-23508928).
 */
export function registerPublicProperties(
    Component: LightningElementConstructor,
    ownPublicProps: string[]
): void {
    Object.defineProperty(Component, '__lwcPublicProperties__', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: resolvePublicProperties(Component, ownPublicProps),
    });
}
