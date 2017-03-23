const {
    freeze,
    seal,
    keys,
    create,
    assign,
    defineProperty,
    getPrototypeOf,
    setPrototypeOf,
    getOwnPropertyDescriptor,
    getOwnPropertyNames,
    defineProperties,
    getOwnPropertySymbols,
} = Object;
const isArray = Array.isArray;
const slice = Array.prototype.slice;

export {
    freeze,
    seal,
    keys,
    create,
    assign,
    defineProperty,
    defineProperties,
    getPrototypeOf,
    setPrototypeOf,
    getOwnPropertyDescriptor,
    getOwnPropertyNames,
    getOwnPropertySymbols,
    slice,
    isArray,
}
