import { LightningElement } from 'lwc';

export default class ConstructorFirstChild extends LightningElement {
    constructor() {
        super();
        this.__firstChild = this.firstChild;
    }
}
