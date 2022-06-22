import { LightningElement, api } from 'lwc';

export default class Click extends LightningElement {
    @api eventCallback;

    handleClick(evt) {
        this.eventCallback(evt);
    }
}
