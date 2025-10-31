import { LightningElement, api } from 'lwc';

export default class Main extends LightningElement {
    @api ssr;

    get mismatchedAttr() {
        return this.ssr ? 'is-server' : 'is-client';
    }
}
