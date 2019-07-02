/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// subtypes from lwc
export interface WireDef {
    params?: {
        [key: string]: string;
    };
    static?: {
        [key: string]: any;
    };
    adapter: any;
    method?: 1;
}
export interface ElementDef {
    // wire is optional on ElementDef but the lwc guarantees it before invoking wiring service hook
    wire: {
        [key: string]: WireDef;
    };
}
