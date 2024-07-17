import { LightningElement, api } from 'lwc';

export default class Main extends LightningElement {
    @api ssr;

    get mismatchingClass() {
        return this.ssr ? 'is-server' : 'is-client';
    }
}
