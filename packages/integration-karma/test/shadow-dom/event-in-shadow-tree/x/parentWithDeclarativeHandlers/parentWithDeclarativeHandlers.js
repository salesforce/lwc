import { LightningElement, api } from 'lwc';

export default class ComposedEvents extends LightningElement {
    @api eventReceived = false;
    @api customEventReceived = false;

    handleEvent() {
        this.eventReceived = true;
    }
    handleCustomEvent() {
        this.customEventReceived = true;
    }
}
