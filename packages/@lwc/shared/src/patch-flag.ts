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
// [2]: https://markojs.com/docs/why-is-marko-fast/#smart-compiler

export const enum PatchFlag {
    CLASS = 1,
    STYLE = 1 << 2,
    ATTRIBUTES = 1 << 3,
    PROPS = 1 << 4,
    CHILDREN = 1 << 5,

    /**
     * Special value that tells the diffing algo to bail out of any optimizations and do a full diff.
     * This value should always evaluate to true for every test like `patchFlag & PatchFlag.SomePatchFlag`
     */
    BAIL = -1,
}
