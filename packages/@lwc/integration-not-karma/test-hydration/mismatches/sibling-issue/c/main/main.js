import { LightningElement, api } from 'lwc';

export default class Main extends LightningElement {
    @api showMe;

    __renderedOnce = false;

    renderedCallback() {
        if (!this.__renderedOnce) {
            this.__renderedOnce = true;
            this.showMe = false;
        }
    }
}
