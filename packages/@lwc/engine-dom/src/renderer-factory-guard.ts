/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { rendererFactory as internalRendererFactory } from './renderer-factory';
import type { RendererAPI } from '@lwc/engine-core';
import type { RendererAPIType } from './renderer-factory';

/*
 * `rendererFactory` is a privileged function: invoking it builds a renderer that reads the DOM directly
 * in the host realm. It is exported from `lwc` only so that external libraries such as Lightning Web
 * Security can `toString` it and recreate a sanitized copy inside their own sandbox — it is not intended
 * to be invoked directly by consumers of the public export.
 *
 * This module wraps the factory so that calling the *exported* function throws by default, while its
 * `toString` still delegates to the untouched, self-contained `renderer-factory` source. That keeps the
 * sanitize + recreate flow working: the recreated factory is a plain function with no guard. The
 * engine's own base renderer imports `renderer-factory` directly (bypassing this wrapper), so internal
 * rendering is unaffected.
 */
function rendererFactory<T extends RendererAPI | null>(baseRenderer: T): RendererAPIType<T> {
    if (!lwcRuntimeFlags.DISABLE_RENDERER_FACTORY_INVOCATION_GUARD) {
        throw new TypeError(
            'Invalid invocation. `rendererFactory` cannot be called directly; it is only meant to be recreated in a sandbox via `rendererFactory.toString()`.'
        );
    }
    return internalRendererFactory(baseRenderer);
}

// Expose the self-contained source of the real factory rather than this guarded wrapper, so that
// `sanitize(rendererFactory.toString())` recreates a working, unguarded factory inside the sandbox.
Object.defineProperty(rendererFactory, 'toString', {
    value: function toString(): string {
        return internalRendererFactory.toString();
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

export { rendererFactory };
