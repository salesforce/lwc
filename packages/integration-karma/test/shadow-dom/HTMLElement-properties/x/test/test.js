import { LightningElement, api } from 'lwc';

export default class MyComponent extends LightningElement {
    @api
    get componentInstance() {
        return this;
    }
}
