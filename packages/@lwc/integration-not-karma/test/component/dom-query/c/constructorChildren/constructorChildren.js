import { LightningElement } from 'lwc';

export default class ConstructorChildren extends LightningElement {
    constructor() {
        super();
        this.__children = this.children;
    }
}
