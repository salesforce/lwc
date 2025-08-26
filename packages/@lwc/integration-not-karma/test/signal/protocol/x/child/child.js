import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api renderCount = 0;
    @api signal;

    renderedCallback() {
        this.renderCount++;
    }
}
