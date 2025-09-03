import { LightningElement, api } from 'lwc';

export default class Foo extends LightningElement {
    @api disconnectedCb;

    disconnectedCallback() {
        this.disconnectedCb.call(null);
    }
}
