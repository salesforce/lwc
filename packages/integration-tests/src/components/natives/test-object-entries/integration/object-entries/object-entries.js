import { LightningElement } from "lwc";

export default class ObjectEntries extends LightningElement {
    // Plain Object
    // ============

    get simple() {
        return Object.entries({ x: 'x' , y: 42 }).join('|');
    }

    get arrayLike() {
        return Object.entries({  0: 'a', 1: 'b', 2: 'c' }).join('|');
    }

    get unordered() {
        return Object.entries({ 100: 'a', 2: 'b', 7: 'c' }).join('|');
    }

    get notEnumerable() {
        const myObj = Object.create({}, {
            x: { value() { return this.z; }, enumerable: false },
            y: { value: 'y', enumerable: false,  },
            z: { value: 'z', enumerable: true },
        });

        return Object.entries(myObj).join('|');
    }

    get nonObject() {
        return Object.entries('foo').join('|');
    }

    get symbol() {
        return Object.entries({
            x: 'x',
            y: 42,
            [Symbol('z')]: 'z',
        }).join('|');
    }

    get iterable() {
        let str = '';
        const obj = { x: 'x' , y: 42 };

        for (const [key, value] of Object.entries(obj)) {
            str += `[${key}:${value}]`;
        }

        return str;
    }

    get arrayOperation() {
        return Object.entries({ x: 'x' , y: 42 }).reduce((acc, [key, value]) => {
            return acc + `[${key}:${value}]`;
        }, '');
    }

    // Proxy Object
    // ============

    get simpleProxy() {
        const proxy = new Proxy({ x: 'x' , y: 42 }, {});
        return Object.entries(proxy).join('|');
    }

    get arrayLikeProxy() {
        const proxy = new Proxy({  0: 'a', 1: 'b', 2: 'c' }, {});
        return Object.entries(proxy).join('|');
    }

    get unorderedProxy() {
        const proxy = new Proxy({ 100: 'a', 2: 'b', 7: 'c' }, {});
        return Object.entries(proxy).join('|');
    }

    get notEnumerableProxy() {
        const obj = Object.create({}, {
            x: { value() { return this.z; }, enumerable: false },
            y: { value: 'y', enumerable: false,  },
            z: { value: 'z', enumerable: true },
        });

        const proxy = new Proxy(obj, {});
        return Object.entries(proxy).join('|');
    }

    get symbolProxy() {
        const proxy = new Proxy({
            x: 'x',
            y: 42,
            [Symbol('z')]: 'z',
        }, {});
        return Object.entries(proxy).join('|');
    }

    get iterableProxy() {
        let str = '';
        const proxy = new Proxy({ x: 'x' , y: 42 }, {});

        for (const [key, value] of Object.entries(proxy)) {
            str += `[${key}:${value}]`;
        }

        return str;
    }

    get arrayOperationProxy() {
        const proxy = new Proxy({ x: 'x' , y: 42 }, {});
        return Object.entries(proxy).reduce((acc, [key, value]) => {
            return acc + `[${key}:${value}]`;
        }, '');
    }
}
