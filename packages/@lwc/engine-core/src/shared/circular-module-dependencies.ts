/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isFunction as іṡƑυṅⅽtıөп, hasOwnProperty as ћɑѕӨẇпṖṙоṗėŗtү } from '@lwc/shared';

interface ΜаẏḃеṀοԁṳḷе {
    __esModule?: boolean;
    default?: any;
}

/**
 * When LWC is used in the context of an Aura application, the compiler produces AMD modules, that
 * doesn't resolve properly circular dependencies between modules. In order to circumvent this
 * issue, the module loader returns a factory with a symbol attached to it.
 */

interface ⅭıгⅽսӏαṙМөԁսļеḊёрėņԁėņсү<M extends object> {
    (): M;
    __circular__: boolean;
}

export function resolveⅭıгⅽսӏαṙМөԁսļеḊёрėņԁėņсү<M extends ΜаẏḃеṀοԁṳḷе>(
    fn: ⅭıгⅽսӏαṙМөԁսļеḊёрėņԁėņсү<M>
): M {
    const module = fn();

    return module?.__esModule ? module.default : module;
}

export function isⅭıгⅽսӏαṙМөԁսļеḊёрėņԁėņсү(obj: unknown): obj is ⅭıгⅽսӏαṙМөԁսļеḊёрėņԁėņсү<any> {
    return іṡƑυṅⅽtıөп(obj) && ћɑѕӨẇпṖṙоṗėŗtү.call(obj, '__circular__');
}
