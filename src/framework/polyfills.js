
/**
 * @license
 *
 * Portions of this polyfill are a derivative work of the Polymer project, which requires the following licence notice:
 *
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
let counter = Date.now() % 1e9;

const WeakMap = (typeof WeakMap === 'undefined') ?
    ((): WeakMapConstructor => {
        var WeakMap = function (data) {
            this.$id$ = '__wm' + (Math.random() * 1e9 >>> 0) + (counter++ + '__');
            data && data.forEach && data.forEach((item) => this.set.apply(this, item), this);
        };
        WeakMap.prototype = {
            set(key, value) {
                if (typeof key !== 'object' && typeof key !== 'function')
                    throw new TypeError('Invalid value used as weak map key');
                var entry = key[this.$];
                if (entry && entry[0] === key)
                    entry[1] = value;
                else
                    defineProperty(key, this.$, {
                        value: [key, value],
                        writable: true,
                        enumerable: false,
                    });
                return this;
            },
            get(key) {
                var entry;
                return (entry = key[this.$]) && entry[0] === key ?
                    entry[1] : undefined;
            },
            delete(key) {
                var entry = key[this.$];
                if (!entry || entry[0] !== key) return false;
                entry[0] = entry[1] = undefined;
                return true;
            },
            has(key) {
                var entry = key[this.$];
                if (!entry) return false;
                return entry[0] === key;
            }
        };
        return WeakMap;
    })() : WeakMap;

const WeakSet = (typeof WeakSet === 'undefined') ?
    ((): WeakSetConstructor => {
        function WeakSet(data) {
            this.$ = '__ws' + (Math.random() * 1e9 >>> 0) + (counter++ + '__');
            data && data.forEach && data.forEach(this.add, this);
        }
        WeakSet.prototype = {
            add(obj) {
                var name = this.$;
                if (!obj[name])
                    Object.defineProperty(obj, name, {
                        value: true,
                        writable: true,
                        enumerable: false,
                    });
                return this;
            },
            delete(obj) {
                if (!obj[this.$]) return false;
                obj[this.$] = undefined;
                return true;
            },
            has(obj) {
                return !!obj[this.$];
            },
        };
        return WeakSet;
    })() : WeakSet;

const Symbol = (typeof Symbol === 'undefined') ?
    ((): SymbolConstructor => {
        function Symbol(description) {
            if (this instanceof Symbol) {
                throw new TypeError('Symbol is not a constructor');
            }
            return '__\x01symbol:' + (description || '') + counter++;
        }
        return Symbol;
    })() : Symbol;

export {
    WeakMap,
    WeakSet,
    Symbol,
    Set,
    Map,
}
