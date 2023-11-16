/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * This API is equivalent to the createElement function exposed by @lwc/engine-dom. It doesn't do anything on
 * the server side, however, you may import it.
 *
 * The whole point of defining this and exporting it is so that you can import it in isomorphic code without
 * an error being thrown by the import itself.
 */
export function createElement() {
    throw new Error('createElement is not supported in @lwc/engine-server, only @lwc/engine-dom.');
}
