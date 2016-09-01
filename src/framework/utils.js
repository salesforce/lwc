// @flow

const Duplex = Symbol('Duplex');

export function duplex(key: any, value: any): Object {
    return {
        key,
        value,
        identity: Duplex,
    };
}

export function isDuplex(obj: any): boolean {
    return obj && obj.identity === Duplex;
}

export const EmptyObject = Object.create(null);
export const EmptyArray = [];
export const EmptyNode = Symbol('Facet');
