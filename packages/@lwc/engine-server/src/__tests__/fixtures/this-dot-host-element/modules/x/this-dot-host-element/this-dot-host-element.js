import { LightningElement } from 'lwc';

export default class ThisDotHostElement extends LightningElement {
    constructor() {
        super();
    }

    get test() {
        return this.hostElement.tagName;
    }
}
