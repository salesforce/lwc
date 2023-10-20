/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Note: This module cannot import any modules because it is meant to be a self-contained function.
 * This is to allow external libraries to access the rendererFactory, toString it and recreate it.
 * For example:
 *  import { rendererFactory } from 'lwc';
 *  import sanitize from 'sanitizeLibrary';
 *
 *  const sandboxedRendererFactory = sanitize(rendererFactory.toString());
 *
 *   Type-Only imports are allowed.
 */
import type { RendererAPI } from '@lwc/engine-core';

// Properties that are either not required to be sandboxed or rely on a globally shared information
// are omitted here
export type SandboxableRendererAPI = Omit<
    RendererAPI,
    'createCustomElement' | 'insertStylesheet' | 'isSyntheticShadowDefined' | 'defineCustomElement'
>;

export type RendererAPIType<Type> = Type extends RendererAPI ? RendererAPI : SandboxableRendererAPI;

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
export function rendererFactory<T extends RendererAPI | null>(baseRenderer: T): RendererAPIType<T> {
    const renderer = process.env.RENDERER as unknown as RendererAPIType<T>;
    // Meant to inherit any properties passed via the base renderer as the argument to the factory.
    Object.setPrototypeOf(renderer, baseRenderer);
    return renderer;
}
