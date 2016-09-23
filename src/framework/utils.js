// @flow

export const EmptyObject = Object.create(null);
export const EmptyArray = [];
import {t} from "./api.js";
import assert from "./assert.js";

function flattenArray(items: array, newList: array) {
    const len = items.length;
    for (let i = 0; i < len; i += 1) {
        const item = items[i];
        if (Array.isArray(item)) {
            flattenArray(item, newList);
        } else if (typeof item === 'string' || typeof item === 'number' || item === undefined) {
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
    assert.isTrue(Array.isArray(items), `The 3rd argument of createElement() should be an array instead of ${items}.`);
    const newList = [];
    flattenArray(items, newList);
    assert.block(() => {
        newList.forEach(assert.element);
    });
    return newList;
}
