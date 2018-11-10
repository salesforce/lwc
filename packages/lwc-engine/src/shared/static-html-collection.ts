import { defineProperty, forEach, ArrayMap, create } from "./language";
import { createFieldName, getInternalField } from "./fields";

const Items = createFieldName('items');

function isValidHTMLCollectionName(name) {
    return name !== 'length' && isNaN(name);
}

function getNodeHTMLCollectionName(node) {
    return node.getAttribute('id') || node.getAttribute('name');
}

class StaticHTMLCollection<T extends Element> extends HTMLCollection {
    [key: number]: T;

    item(index: number): T {
        return this[index];
    }

    // spec: https://dom.spec.whatwg.org/#dom-htmlcollection-nameditem-key
    namedItem(name: string): T | null {
        if (isValidHTMLCollectionName(name) && this[name]) {
            return this[name];
        }
        const items = getInternalField(this, Items);
        // Note: loop in reverse so that the first named item matches the named property
        for (let len = items.length - 1; len >= 0; len -= 1) {
            const item: T = items[len];
            const nodeName = getNodeHTMLCollectionName(item);
            if (nodeName === name) {
                return item;
            }
        }
        return null;
    }

    get length() {
        return getInternalField(this, Items).length;
    }

    // Iterator protocol

    forEach(cb, thisArg) {
        forEach.call(getInternalField(this, Items), cb, thisArg);
    }

    entries() {
        return ArrayMap.call(getInternalField(this, Items), (v: any, i: number) => [i, v]);
    }

    keys() {
        return ArrayMap.call(getInternalField(this, Items), (v: any, i: number) => i);
    }

    values() {
        return getInternalField(this, Items);
    }

    [Symbol.iterator]() {
        let nextIndex = 0;
        return {
            next: () => {
                const items = getInternalField(this, Items);
                return nextIndex < items.length ?
                    {
                        value: items[nextIndex++], done: false
                    } : {
                        done: true
                    };
            }
        };
    }
}

export function createStaticHTMLCollection<T extends Element>(items: T[]): HTMLCollectionOf<T> {
    const collection = create(StaticHTMLCollection.prototype, {
        [Items]: {
            value: items,
        }
    });
    // setting static indexes
    forEach.call(items, (item: T, index: number) => {
        defineProperty(collection, index, {
            value: item,
            enumerable: true,
            configurable: true,
        });
    });
    return collection;
}
