import { LightningElement } from 'lwc';

export default class ConstructorChildNodes extends LightningElement {
    constructor() {
        super();
        this.__childNodes = this.childNodes;
    }
}
