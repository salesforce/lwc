import { LightningElement } from 'lwc';

export default class ConstructorLastChild extends LightningElement {
    constructor() {
        super();
        this.__lastChild = this.lastChild;
    }
}
