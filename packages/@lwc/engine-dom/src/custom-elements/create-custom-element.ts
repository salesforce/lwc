/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { hasCustomElements } from './has-custom-elements';
import { createCustomElementCompat } from './create-custom-element-compat';
import { createNativeCustomElement } from './create-native-custom-element';
import type { LifecycleCallback } from '@lwc/engine-core';

/**
 * We have two modes for creating custom elements:
 *
 * 1. Compat (legacy) browser support (e.g. IE11). Totally custom, doesn't rely on native browser APIs.
 * 2. Native custom element. Note that this allows us to have two LWC components with the same tag name,
 *    via a trick: every custom element constructor we define in the registry is basically the same. It's essentially
 *    a dummy `class extends HTMLElement`. This allows us to have completely customized functionality for different components.
 */
export let createCustomElement: (
    tagName: string,
    upgradeCallback: LifecycleCallback,
    connectedCallback?: LifecycleCallback,
    disconnectedCallback?: LifecycleCallback
) => HTMLElement;

if (hasCustomElements) {
    // use the global registry (native)
    createCustomElement = createNativeCustomElement;
} else {
    // no registry available here
    createCustomElement = createCustomElementCompat;
}
