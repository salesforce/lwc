/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * These swapComponent is equivalent to the { swapComponent } functions exposed by @lwc/engine-dom. It doesn't do anything on
 * the server side, however, you may import it.
 *
 * The whole point of defining this and exporting it is so that you can import it in isomorphic code without
 * an error being thrown by the import itself.
 * @throws Always throws, as it should not be used.
 */
export function swapComponent(): never {
    throw new Error('swapComponent is not supported in @lwc/engine-server, only @lwc/engine-dom.');
}

/**
 * These swapStyle API is equivalent to the { swapStyle } functions exposed by @lwc/engine-dom. It doesn't do anything on
 * the server side, however, you may import it.
 *
 * The whole point of defining this and exporting it is so that you can import it in isomorphic code without
 * an error being thrown by the import itself.
 * @throws Always throws, as it should not be used.
 */
export function swapStyle(): never {
    throw new Error('swapStyle is not supported in @lwc/engine-server, only @lwc/engine-dom.');
}

/**
 * These swapTemplate API are equivalent to the { swapTemplate } functions exposed by @lwc/engine-dom. It doesn't do anything on
 * the server side, however, you may import it.
 *
 * The whole point of defining this and exporting it is so that you can import it in isomorphic code without
 * an error being thrown by the import itself.
 * @throws Always throws, as it should not be used.
 */
export function swapTemplate(): never {
    throw new Error('swapTemplate is not supported in @lwc/engine-server, only @lwc/engine-dom.');
}

/**
 * The hot API is used to orchestrate hot swapping in client rendered components.
 * It doesn't do anything on the server side, however, you may import it.
 *
 * The whole point of defining this and exporting it is so that you can import it in isomorphic code without
 * an error being thrown by the import itself.
 */
export const hot = undefined;
