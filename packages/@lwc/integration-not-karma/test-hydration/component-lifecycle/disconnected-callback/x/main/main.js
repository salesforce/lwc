import { LightningElement, api } from 'lwc';

export default class Main extends LightningElement {
    @api disconnectedCb;
    @api showFoo;

    disconnectedCallback() {
        this.disconnectedCb.call(null);
    }
}
