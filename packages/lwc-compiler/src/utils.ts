/**
 * Returns true if the value is undefined
 * @param {any} o
 */
export function isUndefined(o: any): o is undefined {
    return o === undefined;
}

/**
 * Returns true if the value is a string
 * @param {any} o
 */
export function isString(o: any): o is string {
    return typeof o === 'string';
}

/**
 * Returns true if the value is a boolean
 * @param {any} o
 */
export function isBoolean(o: any): o is boolean {
    return typeof o === 'boolean';
}

