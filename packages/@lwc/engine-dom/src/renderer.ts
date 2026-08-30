/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { assign, hasOwnProperty, KEY__SHADOW_TOKEN, noop } from '@lwc/shared';
import { insertStylesheet } from './styles';
import {
    createCustomElement,
    getUpgradableConstructor,
} from './custom-elements/create-custom-element';
import { rendererFactory } from './renderer-factory';
import type { RendererAPI } from '@lwc/engine-core';

// Host element mutation tracking is for SSR only
const startTrackingMutations = noop;
const stopTrackingMutations = noop;

/**
 * The base renderer that will be used by engine-core.
 * This will be used for DOM operations when lwc is running in a browser environment.
 */
export const renderer: RendererAPI = assign(
    // The base renderer will invoke the factory with null and assign additional properties that are
    // shared across renderers. This is the factory's single expected invocation per realm; it marks
    // the renderer as created so that, when ENABLE_RENDERER_FACTORY_GUARD is set, later invocations are
    // rejected (see renderer-factory.ts).
    rendererFactory(null),
    // Properties that are either not required to be sandboxed or rely on a globally shared information
    {
        // insertStyleSheet implementation shares a global cache of stylesheet data
        insertStylesheet,
        // relies on a shared global cache
        createCustomElement,
        defineCustomElement: getUpgradableConstructor,
        isSyntheticShadowDefined: hasOwnProperty.call(Element.prototype, KEY__SHADOW_TOKEN),
        startTrackingMutations,
        stopTrackingMutations,
    }
);
