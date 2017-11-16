/**
 * This module provides utilities for managing wire adapters.
 */

/**
 * Populates a target map from a source object.
 * @param {Map} target The map to populate.
 * @param {Object<String, Function>} source The source of key-values to populate.
 */
function populateMap(target, source) {
    Object.keys(source).forEach(key => {
        const value = source[key];
        if (typeof value !== 'function') {
            throw new Error(`Invalid wire adapter: value must be a function, found ${typeof value}.`);
        } else if (target.has(key)) {
            throw new Error(`Duplicate wire adapter id ${key}'.`);
        }
        target.set(key, value);
    });
}

/**
 * Returns a map of wire adapter id to handler.
 * @param {Array<Object<String, Function>>} adapters The wire adapters.
 * @return {Map} A map of wire adapter id to handler.
 */
export function buildWireAdapterMap(adapters) {
    const map = new Map();
    adapters.forEach(a => {
        populateMap(map, a());
    });
    return map;
}
