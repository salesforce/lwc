/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { hasCustomElements } from './has-custom-elements';
import { createCustomElementCompat } from './create-custom-element-compat';
import { createCustomElementUsingUpgradableConstructor } from './create-custom-element-using-upgradable-constructor';
import type { LifecycleCallback } from '@lwc/engine-core';

/**
 * We have three modes for creating custom elements:
 *
 * 1. Compat (legacy) browser support (e.g. IE11). Totally custom, doesn't rely on native browser APIs.
 * 2. "Upgradable constructor" custom element. This allows us to have two LWC components with the same tag name,
 *    via a trick: every custom element constructor we define in the registry is basically the same. It's essentially
 *    a dummy `class extends HTMLElement` that accepts an `upgradeCallback` in its constructor ("upgradable
 *    constructor"), which allows us to have completely customized functionality for different components.
 * 3. "Scoped" (or "pivot") custom elements. This relies on a sophisticated system that emulates the "scoped custom
 *    elements registry" proposal, with support for avoiding conflicts in tag names both between LWC components and
 *    between LWC components and third-party elements. This uses a similar trick to #2, but is much more complex
 *    because it must patch the global `customElements` and `HTMLElement` objects.
 */
export let createCustomElement: (
    tagName: string,
    upgradeCallback: LifecycleCallback,
    connectedCallback?: LifecycleCallback,
    disconnectedCallback?: LifecycleCallback
) => HTMLElement;

if (hasCustomElements) {
    // use the global registry, with an upgradable constructor for the defined custom element
    createCustomElement = createCustomElementUsingUpgradableConstructor;
} else {
    // no registry available here
    createCustomElement = createCustomElementCompat;
}
