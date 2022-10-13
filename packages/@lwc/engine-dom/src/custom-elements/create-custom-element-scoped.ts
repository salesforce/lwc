/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import features from '@lwc/features';
import { createScopedRegistry, CreateScopedConstructor } from '@lwc/scoped-registry';
import { hasCustomElements } from './has-custom-elements';
import type { LifecycleCallback } from '@lwc/engine-core';

let createScopedConstructor: CreateScopedConstructor | undefined;
let CachedHTMLElement: typeof HTMLElement | undefined;

// We only call `createScopedRegistry()` if the browser supports custom elements and
// ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY is enabled, because we don't want to patch eagerly if the flag is disabled
// or we're in a legacy browser.
if (features.ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY) {
    if (hasCustomElements) {
        // If ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY is true, then we eagerly initialize the scoped registry.
        // It's assumed that ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY is set *before* LWC loads, and never changes.
        //
        // Why not lazily patch in `createCustomElement`? Well, this could lead to subtle bugs, e.g.:
        //
        // 1. LWC loads
        // 2. `const Ctor = class extends HTMLElement {}`
        // 3. `lwc.createElement(...)` // here we lazily patch
        // 4. `customElements.define('x-foo', Ctor)` // throws error because class is bound to stale HTMLElement
        //
        // To reduce the risk of this, it's safer to patch the registry eagerly.
        createScopedConstructor = createScopedRegistry();

        // It's important to cache window.HTMLElement here. Otherwise, someone else could overwrite window.HTMLElement (e.g.
        // another copy of the engine, or another scoping implementation) and we would get "Illegal constructor" errors
        // because the HTMLElement prototypes are mixed up.
        //
        // The reason this happens is that the scoping implementation overwrites window.HTMLElement and expects to work
        // with that version of HTMLElement. So if you load two copies of the scoping implementation in the same environment,
        // the second one may accidentally grab window.HTMLElement from the first (when doing `class extends HTMLElement`).
        // Caching avoids this problem.
        CachedHTMLElement = window.HTMLElement;
    }
}

// Creates a constructor that is intended to be used as the UserConstructor in a scoped (pivots) registry.
// In this case, the upgradeCallback only needs to be defined once because we create these on-demand,
// multiple times per tag name.
const createUserConstructor = (
    upgradeCallback: LifecycleCallback,
    connectedCallback: LifecycleCallback,
    disconnectedCallback: LifecycleCallback,
    HTMLElementToExtend: typeof HTMLElement
) => {
    // TODO [#2972]: this class should expose observedAttributes as necessary
    return class UserConstructor extends HTMLElementToExtend {
        constructor() {
            super();
            upgradeCallback(this);
        }

        connectedCallback() {
            connectedCallback(this);
        }

        disconnectedCallback() {
            disconnectedCallback(this);
        }
    };
};

export function createCustomElementScoped(
    tagName: string,
    upgradeCallback: LifecycleCallback,
    connectedCallback: LifecycleCallback,
    disconnectedCallback: LifecycleCallback
) {
    if (isUndefined(createScopedConstructor) || isUndefined(CachedHTMLElement)) {
        // This error should be impossible to hit
        throw new Error(
            'The flag ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY must be set to true to use this feature'
        );
    }

    const UserConstructor = createUserConstructor(
        upgradeCallback,
        connectedCallback,
        disconnectedCallback,
        CachedHTMLElement
    );
    const ScopedConstructor = createScopedConstructor(tagName, UserConstructor);
    return new ScopedConstructor(UserConstructor);
}
