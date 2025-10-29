import { LightningElement, api } from 'lwc';

function getDescriptor(obj, prop) {
    let res;
    while (!res && obj) {
        res = Object.getOwnPropertyDescriptor(obj, prop);
        obj = Object.getPrototypeOf(obj);
    }
    return res;
}

export default class extends LightningElement {
    @api
    getEnumerableProps() {
        const props = [];
        for (const prop in this) {
            props.push(prop);
        }
        return props.sort();
    }

    @api
    getEnumerableAndWritableProps() {
        return this.getEnumerableProps().filter((prop) => getDescriptor(this, prop).writable);
    }

    @api
    getEnumerableAndConfigurableProps() {
        return this.getEnumerableProps().filter((prop) => getDescriptor(this, prop).configurable);
    }
}
