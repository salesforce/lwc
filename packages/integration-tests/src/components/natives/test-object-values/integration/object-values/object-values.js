import { LightningElement } from 'lwc';

export default class ObjectValues extends LightningElement {
    // Plain Object
    // ============

    get simple() {
        return Object.values({ x: 'x', y: 42 }).join('|');
    }

    get arrayLike() {
        return Object.values({ 0: 'a', 1: 'b', 2: 'c' }).join('|');
    }

    get unordered() {
        return Object.values({ 100: 'a', 2: 'b', 7: 'c' }).join('|');
    }

    get notEnumerable() {
        const myObj = Object.create(
            {},
            {
                x: {
                    value() {
                        return this.z;
                    },
                    enumerable: false,
                },
                y: { value: 'y', enumerable: false },
                z: { value: 'z', enumerable: true },
            }
        );

        return Object.values(myObj).join('|');
    }

    get nonObject() {
        return Object.values('foo').join('|');
    }

    get symbol() {
        return Object.values({
            x: 'x',
            y: 42,
            [Symbol('z')]: 'z',
        }).join('|');
    }

    // Proxy Object
    // ============

    get simpleProxy() {
        const proxy = new Proxy({ x: 'x', y: 42 }, {});
        return Object.values(proxy).join('|');
    }

    get arrayLikeProxy() {
        const proxy = new Proxy({ 0: 'a', 1: 'b', 2: 'c' }, {});
        return Object.values(proxy).join('|');
    }

    get unorderedProxy() {
        const proxy = new Proxy({ 100: 'a', 2: 'b', 7: 'c' }, {});
        return Object.values(proxy).join('|');
    }

    get notEnumerableProxy() {
        const obj = Object.create(
            {},
            {
                x: {
                    value() {
                        return this.z;
                    },
                    enumerable: false,
                },
                y: { value: 'y', enumerable: false },
                z: { value: 'z', enumerable: true },
            }
        );

        const proxy = new Proxy(obj, {});
        return Object.values(proxy).join('|');
    }

    get symbolProxy() {
        const proxy = new Proxy(
            {
                x: 'x',
                y: 42,
                [Symbol('z')]: 'z',
            },
            {}
        );
        return Object.values(proxy).join('|');
    }
}
