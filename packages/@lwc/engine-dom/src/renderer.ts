/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { globalThis, assign } from '@lwc/shared';
import { insertStylesheet } from './styles';
import { rendererFactory } from './renderer-factory';
import type { RendererAPI } from '@lwc/engine-core';

/**
 * The base renderer that will be used by engine-core.
 * This will be used for DOM operations when lwc is running in a browser environment.
 */
export const renderer: RendererAPI = assign(
    rendererFactory(globalThis),
    // Properties that are either not required to be sandboxed or rely on a globally shared information
    {
        // insertStyleSheet implementation shares a global cache of stylesheet data
        insertStylesheet,
    }
);
