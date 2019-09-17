import { LightningElement, api } from 'lwc';

export default class ParentWithDynamicChild extends LightningElement {
    @api
    eventListener;

    clickHandler(evt) {
        return this.eventListener && this.eventListener(evt);
    }
}
