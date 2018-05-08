import { Element } from 'engine';

export default class EnumerablePropertyLeak extends Element {
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
