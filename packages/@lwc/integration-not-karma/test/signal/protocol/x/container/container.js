import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api renderCount = 0;

    renderedCallback() {
        this.renderCount++;
    }
}
