/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { isConcatSpreadable } = Symbol;
const { isArray } = Array;
const { slice: ArraySlice, unshift: ArrayUnshift, shift: ArrayShift } = Array.prototype;

function isObject(O: any): boolean {
    return typeof O === 'object' ? O !== null : typeof O === 'function';
}

// https://www.ecma-international.org/ecma-262/6.0/#sec-isconcatspreadable
function isSpreadable(O: any): boolean {
    if (!isObject(O)) {
        return false;
    }

    const spreadable = O[isConcatSpreadable];
    return spreadable !== undefined ? Boolean(spreadable) : isArray(O);
}

// https://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.concat
function ArrayConcatPolyfill(this: any, ..._args: any[][]): any[] {
    const O = Object(this);
    const A: any = [];
    let N = 0;

    const items = ArraySlice.call(arguments);
    ArrayUnshift.call(items, O);

    while (items.length) {
        const E = ArrayShift.call(items);

        if (isSpreadable(E)) {
            let k = 0;
            const length = E.length;
            for (k; k < length; k += 1, N += 1) {
                if (k in E) {
                    const subElement = E[k];
                    A[N] = subElement;
                }
            }
        } else {
            A[N] = E;
            N += 1;
        }
    }

    return A;
}

export default function apply() {
    // eslint-disable-next-line no-extend-native
    Array.prototype.concat = ArrayConcatPolyfill;
}
