import { LightningElement } from 'lwc';

let propertyToSet;
let propertyValue;

export function propertyAndValueToSetInConstructor(prop, value) {
    propertyToSet = prop;
    propertyValue = value;
}
export default class MyComponent extends LightningElement {
    constructor() {
        super();
        this[propertyToSet] = propertyValue;
    }
}
