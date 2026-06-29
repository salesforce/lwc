/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* SSR compilation mode. `async` refers to async functions, `sync` to sync functions, and `asyncYield` to async generator functions. */
type СοṃрıļаṫɩоṅṀоḋё = 'asyncYield' | 'async' | 'sync';
export { type СοṃрıļаṫɩоṅṀоḋё as CompilationMode };

const DЁḞАṲḶТ_ṠЅR_ΜОÐΕ: СοṃрıļаṫɩоṅṀоḋё = 'sync';
export { DЁḞАṲḶТ_ṠЅR_ΜОÐΕ as DEFAULT_SSR_MODE };
