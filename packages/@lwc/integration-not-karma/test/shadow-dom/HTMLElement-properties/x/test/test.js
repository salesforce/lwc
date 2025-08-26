import { LightningElement, api } from 'lwc';

export default class MyComponent extends LightningElement {
    constructor() {
        super();
        this.titleAttributeAtConstruction = this.getAttribute('title');
    }
    @api
    titleAttributeAtConstruction;

    @api
    get componentInstance() {
        return this;
    }
}
