/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/*
 * Note: This module cannot import any modules because it is meant to be a self-contained function.
 * This is to allow external libraries to access the rendererFactory, toString it and recreate it.
 * For example:
 * import { rendererFactory } from 'lwc';
 * import sanitize from 'sanitizeLibrary';
 * const sandboxedRendererFactory = sanitize(rendererFactory.toString());
 *
 * Type-Only imports are allowed.
 */

import type { RendererAPI } from '@lwc/engine-core';

declare global {
    // Records whether this function has already produced a renderer in the current realm. It is kept on
    // the global rather than in module scope so that this function stays self-contained: its source text
    // (read via `Function.prototype.toString`) must reference no variables from the surrounding module in
    // order to be recreated in another realm. `globalThis` exists in every realm, so a reference to it
    // survives that recreation.
    var __lwcRendererFactoryInvoked: boolean | undefined;
}

// Properties that are either not required to be sandboxed or rely on a globally shared information
// are omitted here
export type SandboxableRendererAPI = Omit<
    RendererAPI,
    | 'createCustomElement'
    | 'insertStylesheet'
    | 'isSyntheticShadowDefined'
    | 'defineCustomElement'
    | 'startTrackingMutations'
    | 'stopTrackingMutations'
>;

export type RendererAPIType<Type> = Type extends RendererAPI ? RendererAPI : SandboxableRendererAPI;

/**
 * A factory function that produces a renderer.
 * Renderer encapsulates operations that are required to render an LWC component into the underlying
 * runtime environment. In the case of @lwc/enigne-dom, it is meant to be used in a DOM environment.
 * @param baseRenderer Either null or the base renderer imported from 'lwc'.
 * @returns The created renderer
 * @example
 * import { renderer, rendererFactory } from 'lwc';
 * const customRenderer = rendererFactory(renderer);
 */
export function rendererFactory<T extends RendererAPI | null>(baseRenderer: T): RendererAPIType<T> {
    // Invariant (W-23814927): this factory is expected to build a renderer exactly once per realm — the
    // engine's own bootstrap of the base `renderer`. `globalThis.__lwcRendererFactoryInvoked` records
    // that a renderer has already been produced; when `ENABLE_RENDERER_FACTORY_GUARD` is set, any later
    // invocation is rejected. The flag and the marker are reached through globals (the ambient
    // `lwcRuntimeFlags` and `globalThis`) rather than through module-scoped variables, so this function
    // stays self-contained: its source text can be read via `Function.prototype.toString` and recreated
    // in another realm without referencing anything from this module. `typeof` keeps the check inert in a
    // realm where the flag global is absent, so recreation elsewhere is unaffected and, by default (flag
    // unset), the factory stays freely re-invocable exactly as before.
    const alreadyCreated = globalThis.__lwcRendererFactoryInvoked === true;
    globalThis.__lwcRendererFactoryInvoked = true;
    if (
        alreadyCreated &&
        typeof lwcRuntimeFlags !== 'undefined' &&
        lwcRuntimeFlags.ENABLE_RENDERER_FACTORY_GUARD
    ) {
        throw new Error(
            'Invalid invocation of rendererFactory. The renderer has already been created and cannot be recreated.'
        );
    }
    // Type assertion because this is replaced by rollup with an object, not a string.
    // See `injectInlineRenderer` in /scripts/rollup/rollup.config.js
    const renderer = process.env.RENDERER as unknown as RendererAPIType<T>;
    // Meant to inherit any properties passed via the base renderer as the argument to the factory.
    Object.setPrototypeOf(renderer, baseRenderer);
    return renderer;
}
