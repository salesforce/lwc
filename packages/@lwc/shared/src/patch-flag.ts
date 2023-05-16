/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Modeled after Vue [1] and Marko [2], patch flags are an optimization mechanism to communicate from
// the template compiler to the diffing algo at runtime to explain which parts of the vnode (attrs, props, etc.)
// actually need to be diffed and which ones don't. The bitwise operator can be used to quickly tell if a
// patch flag is enabled or not.
// [1]: https://vuejs.org/guide/extras/rendering-mechanism.html#patch-flags
// [2]: https://markojs.com/docs/why-is-marko-fast/

export const enum PatchFlag {
    /**
     * Indicates that the vnode has a dynamic class attribute
     */
    CLASS = 1,

    /**
     * Indicates that the vnode has a dynamic style attribute
     */
    STYLE = 1 << 2,

    /**
     * Indicates that the vnode has dynamic non-class, non-style attributes to set
     */
    ATTRIBUTES = 1 << 3,

    /**
     * Indicates that the vnode has dynamic properties to set
     */
    PROPS = 1 << 4,

    /**
     * Indicates that the vnode has only text nodechildren
     */
    TEXT = 1 << 6,

    /**
     * Special value that tells the diffing algo to bail out of any optimizations and do a full diff.
     * This value should always evaluate to true for every test like `patchFlag & PatchFlag.SomePatchFlag`
     */
    BAIL = -1,
}
