var toRemove = [
    {
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
            'EPSILON',
            'isFinite',
            'isInteger',
            'isNaN',
            'isSafeInteger',
            'MAX_SAFE_INTEGER',
            'MIN_SAFE_INTEGER',
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
            'is',
            'setPrototypeOf'
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

for(var k = 0; k < toRemove.length; k += 1) {
    var removeKey = toRemove[k];
    for(var i = 0; i < removeKey.keys.length; i+= 1) {
        var key = removeKey.keys[i];
        delete removeKey.object[key];
    }
}