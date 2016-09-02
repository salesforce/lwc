// @flow

export const EmptyObject = Object.create(null);
export const EmptyArray = [];
import {t} from "./api.js";

function flattenArray(items: array, newList: array) {
    const len = items.length;
    for (let i = 0; i < len; i += 1) {
        const item = items[i];
        if (Array.isArray(item)) {
            flattenArray(item, newList);
        } else if (typeof item === 'string') {
            newList.push(t(item));
        } else {
            newList.push(item);
        }
    }
}

export function flattenElements(items: array): array {
    if (items === EmptyArray) {
        return items;
    }
    if (DEVELOPMENT) {
        assert(Array.isArray(items), `The 3rd argument of createElement() should be an array instead of ${items}.`);
    }
    const newList = [];
    flattenArray(items, newList);
    if (DEVELOPMENT) {
        newList.forEach(assertElement);
    }
    return newList;
}

export function assert(value: any, message: string) {
    if (DEVELOPMENT) {
        if (!value) {
            throw new Error(`Invariant Violation: ` + message);
        }
    }
}

export function assertElement(element: Object) {
    if (DEVELOPMENT) {
        if (element && 'Ctor' in element) {
            if (!Array.isArray(element.children)) {
                throw new Error(`Invariant Violation: ${element}.children most be an array of element instead of ${element.children}.`);
            }
            return;
        }
        throw new Error(`Invariant Violation: Invalid element ${element}.`);
    }
}
