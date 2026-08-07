/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { LightningElementConstructor } from './lightning-element';

/** The class property that holds a component's resolved `@api` allowlist. */
export const PUBLIC_PROPERTIES_KEY = '__lwcPublicProperties__';

interface PublicPropertiesHolder {
    [PUBLIC_PROPERTIES_KEY]?: Set<string>;
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
    const superPublicProps = SuperClass[PUBLIC_PROPERTIES_KEY] ?? [];
    return new Set([...ownPublicProps, ...superPublicProps]);
}

/**
 * Attach the resolved allowlist to a class and return it. This is the single place that writes
 * `__lwcPublicProperties__`; `setStaticInternals` delegates the write here and layers on the rest
 * of its machinery (generate-markup, default template, wire adapters). The compiler emits a full
 * `setStaticInternals` only for the exported component, so it calls this directly for non-exported
 * in-file base classes, giving them their own allowlist for the runtime union (W-23508928).
 */
export function registerPublicProperties(
    Component: LightningElementConstructor,
    ownPublicProps: string[]
): Set<string> {
    const publicProps = resolvePublicProperties(Component, ownPublicProps);
    Object.defineProperty(Component, PUBLIC_PROPERTIES_KEY, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: publicProps,
    });
    return publicProps;
}
