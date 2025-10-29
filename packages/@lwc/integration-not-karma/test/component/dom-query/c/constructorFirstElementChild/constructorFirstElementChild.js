import { LightningElement } from 'lwc';

export default class ConstructorFirstElementChild extends LightningElement {
    constructor() {
        super();
        this.__firstElementChild = this.firstElementChild;
    }
}
