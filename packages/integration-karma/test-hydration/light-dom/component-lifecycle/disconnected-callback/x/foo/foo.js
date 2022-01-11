import { LightningElement, api } from 'lwc';

export default class Foo extends LightningElement {
    static renderMode = 'light';

    @api disconnectedCb;

    disconnectedCallback() {
        this.disconnectedCb.call(null);
    }
}
