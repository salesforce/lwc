import { LightningElement } from 'lwc';

export default class JsonStringify extends LightningElement {
    get objectStringify() {
        const arr = new Proxy(
            {
                x: 'x',
                y: 'y',
            },
            {},
        );

        return JSON.stringify(arr);
    }

    get arrayStringify() {
        const arr = new Proxy([1, 2], {});

        return JSON.stringify(arr);
    }

    get complexObjectStringify() {
        const obj = new Proxy(
            {
                string: 'x',
                number: 1,
                boolean: true,
                undefined: undefined,
                null: null,
                object: { x: 'x' },
                [Symbol('symbol')]: true,
            },
            {},
        );

        return JSON.stringify(obj);
    }

    get nestedObjectStringify() {
        const nested = new Proxy(
            {
                x: new Proxy({ y: true }, {}),
                z: new Proxy([false], {}),
            },
            {},
        );

        return JSON.stringify(nested);
    }
}
