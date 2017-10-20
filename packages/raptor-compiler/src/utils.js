/**
 * Takes 2 arrays and returns an object formed by associating properties with values
 * @param {string[]} props
 * @param {any[]} values
 */
export function zipObject(props, values) {
    return props.reduce((obj, prop, index) => {
        obj[prop] = values[index];
        return obj;
    }, {});
}

/**
 * Returns true if the value is undefined
 * @param {any} o
 */
export function isUndefined(o) {
    return o === undefined;
}

/**
 * Returns true if the value is a string
 * @param {any} o
 */
export function isString(o) {
    return typeof o === 'string';
}
