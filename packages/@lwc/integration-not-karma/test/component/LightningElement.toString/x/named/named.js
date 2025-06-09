import { LightningElement, api } from 'lwc';

export default class MyFancyComponent extends LightningElement {
    @api
    getToString() {
        return String(this);
    }
}
