import { LightningElement, api } from 'lwc';

export default class ParentWithDomManualChild extends LightningElement {
    @api
    eventListener;

    clickHandler(evt) {
        return this.eventListener && this.eventListener(evt);
    }
}
