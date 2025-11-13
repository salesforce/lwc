import { LightningElement } from 'lwc';

export default class ConstructorLastElementChild extends LightningElement {
    constructor() {
        super();
        this.__lastElementChild = this.lastElementChild;
    }
}
