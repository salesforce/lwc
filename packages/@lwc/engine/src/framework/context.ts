/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Template } from './template';

export interface Context {
    hostAttribute?: string;
    shadowAttribute?: string;
    tplCache?: Template;
    [key: string]: any;
}

export let currentContext: Context = {};

export function establishContext(ctx: Context) {
    currentContext = ctx;
}
