import { LightningElement, api } from 'lwc';

export default class EventHandler extends LightningElement {
    @api clickHandler;

    connectedCallback() {
        this.addEventListener('click', this.clickHandler);
    }
}
