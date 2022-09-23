/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Note: This module cannot import any modules because it is meant to be a pure function.
 *   Type-Only imports are allowed.
 *   and the createRender function, which is pure (ensured via rollup plugin)
 */
import createBaseRenderer from './renderer/index';
import type { RendererAPI } from '@lwc/engine-core';

/**
 * A factory function that produces a renderer.
 * Renderer encapsulates operations that are required to render an LWC component into the underlying
 * runtime environment. In the case of @lwc/enigne-dom, it is meant to be used in a DOM environment.
 * Example usage:
 * import { renderer, rendererFactory } from 'lwc';
 * const customRenderer = rendererFactory(renderer);
 *
 * @param baseRenderer Either null or the base renderer imported from 'lwc'.
 */
export function rendererFactory(
    baseRenderer: RendererAPI | null
): Omit<RendererAPI, 'insertStylesheet' | 'isNativeShadowDefined' | 'isSyntheticShadowDefined'> {
    const renderer = createBaseRenderer();

    // Meant to inherit any properties passed via the base renderer as the argument to the factory.
    Object.setPrototypeOf(renderer, baseRenderer);
    return renderer;
}
