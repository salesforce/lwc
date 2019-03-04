import { LightningElement } from 'lwc';

export default class EnumerablePropertyLeak extends LightningElement {
    get objectEnumerableProperties() {
        const properties = [];

        const obj = { x: 'x', y: 'y' };
        for (let property in obj) {
            properties.push(property);
        }

        return properties;
    }

    get arrayEnumerableProperties() {
        const properties = [];

        const array = ['x', 'y'];
        for (let property in array) {
            properties.push(property);
        }

        return properties;
    }
}
