import { defineProperty, forEach, ArrayMap } from "../shared/language";

export class SyntheticNodeList<T extends Node> implements NodeListOf<T> {
    [key: number]: T;
    items: T[];
    constructor(items: T[]) {
        // Array backed nodelist
        defineProperty(this, 'items', {
            value: items,
            enumerable: false,
            configurable: false,
            writable: false,
        });

        items.forEach((item, index) => {
            defineProperty(this, index, {
                value: items[index],
                enumerable: true,
                configurable: true,
                writable: false,
            });
        });
    }

    item(index: number): T {
        return this[index];
    }

    get length() {
        return this.items.length;
    }

    // Iterator protocol

    forEach(cb, thisArg) {
        forEach.call(this.items, cb, thisArg);
    }

    entries() {
        return ArrayMap.call(this.items, (v: any, i: number) => [i, v]);
    }

    keys() {
        return ArrayMap.call(this.items, (v: any, i: number) => i);
    }

    values() {
        return this.items;
    }

    [Symbol.iterator]() {
        let nextIndex = 0;
        return {
            next: () => {
                return nextIndex < this.items.length ?
                    {
                        value: this.items[nextIndex++], done: false
                    } : {
                        done: true
                    };
            }
        };
    }
}
