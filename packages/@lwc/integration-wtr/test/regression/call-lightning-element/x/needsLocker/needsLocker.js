import { LightningElement } from 'lwc';

export default class Component extends LightningElement {
    constructor() {
        super();
        Reflect.apply(LightningElement, this, []);
    }
}
