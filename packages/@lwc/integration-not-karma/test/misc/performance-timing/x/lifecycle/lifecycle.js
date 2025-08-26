import { LightningElement } from 'lwc';

export default class LifeCycle extends LightningElement {
    constructor() {
        super();
    }

    connectedCallback() {}
    disconnectedCallback() {}
    renderedCallback() {}
}
