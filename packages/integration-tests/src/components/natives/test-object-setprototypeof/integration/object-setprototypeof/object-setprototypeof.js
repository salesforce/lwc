import { LightningElement } from "lwc";

export default class ObjectSetPrototypeOf extends LightningElement {
    get isArrayPrototype() {
        const obj = {};
        Object.setPrototypeOf(obj, []);
        return obj instanceof Array;
    }

    get isProxyPrototypeDocument () {
        const proxy = new Proxy({}, {
            setPrototypeOf(target) {
                return Object.setPrototypeOf(target, document);
            }
        });
        Object.setPrototypeOf(proxy, []);
        return proxy instanceof Document;
    }

    get isProxyPrototypeArray() {
        const proxy = new Proxy({}, {
            setPrototypeOf(target) {
                return Object.setPrototypeOf(target, document);
            }
        });
        Object.setPrototypeOf(proxy, []);
        return proxy instanceof Array;
    }

    get extractedCorrectPrototype() {
        const obj = {};
        const proto = [];
        Object.setPrototypeOf(obj, proto);
        return Object.getPrototypeOf(obj) === proto;
    }
}
