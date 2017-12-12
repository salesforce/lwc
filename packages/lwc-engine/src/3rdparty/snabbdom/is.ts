export var array = Array.isArray;
export function primitive(s) {
    return typeof s === 'string' || typeof s === 'number';
}
