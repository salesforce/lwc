/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
(function () {
    var toRemove = [{
            object: window,
            keys: [
                'Proxy',
                'Symbol',
                'Map',
                'Promise',
                'Set',
                'WeakSet',
                'WeakMap',
                'ArrayBuffer',
                'DataView',
                'Float32Array',
                'Float64Array',
                'Int16Array',
                'Int32Array',
                'Int8Array',
                'Uint16Array',
                'Uint32Array',
                'Uint8Array',
                'Uint8ClampedArray'
            ]
        },
        {
            object: String,
            keys: [
                'fromCodePoint',
                'raw'
            ]
        },
        {
            object: Number,
            keys: [
                'isFinite',
                'isInteger',
                'isNaN',
                'isSafeInteger',
                'parseFloat',
                'parseInt'
            ]
        },
        {
            object: Array,
            keys: [
                'from',
                'of'
            ]
        },
        {
            object: Object,
            keys: [
                'values',
                'entries',
                'assign',
                'is'
            ]
        },
        {
            object: Function,
            keys: [
                'name'
            ]
        },
        {
            object: Array.prototype,
            keys: [
                'includes',
                'fill',
                'findIndex',
                'find'
            ]
        },
    ];
    for (var k = 0; k < toRemove.length; k += 1) {
        var removeKey = toRemove[k];
        for (var i = 0; i < removeKey.keys.length; i += 1) {
            var key = removeKey.keys[i];
            delete removeKey.object[key];
        }
    }
}());
