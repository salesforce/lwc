import { defineProperty, forEach, ArrayMap, create } from "./language";
import { createFieldName, getInternalField } from "./fields";

const Items = createFieldName('items');

export class StaticNodeList<T extends Node> extends NodeList {
    [key: number]: T;

    item(index: number): T {
        return this[index];
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

export function createStaticNodeList<T extends Node>(items: T[]): NodeListOf<T> {
    const nodeList = create(StaticNodeList.prototype, {
        [Items]: {
            value: items,
        }
    });
    // setting static indexes
    forEach.call(items, (item: T, index: number) => {
        defineProperty(nodeList, index, {
            value: item,
            enumerable: true,
            configurable: true,
        });
    });
    return nodeList;
}
