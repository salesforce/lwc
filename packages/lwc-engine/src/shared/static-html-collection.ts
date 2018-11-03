import { defineProperty, forEach, ArrayMap, create } from "./language";
import { createFieldName, getInternalField } from "./fields";

const Items = createFieldName('items');

class StaticHTMLCollection<T extends Element> extends HTMLCollection {
    [key: number]: T;

    item(index: number): T {
        return this[index];
    }

    // spec: https://dom.spec.whatwg.org/#dom-htmlcollection-nameditem-key
    namedItem(key: string): T | null {
        if (key === '') { return null; }
        const items = getInternalField(this, Items);
        for (let i = 0, len = items.length; i < len; i += 1) {
            const item: T = items[i];
            if (item.id === key || (item.hasAttribute('name') && (item as any).name === key)) {
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
