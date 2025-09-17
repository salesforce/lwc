import { LightningElement } from 'lwc';

export default class ConstructorInvocation extends LightningElement {
    constructor() {
        super();
        this.getBoundingClientRect();
    }
}
