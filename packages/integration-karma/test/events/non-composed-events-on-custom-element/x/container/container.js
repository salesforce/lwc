import { LightningElement, track } from 'lwc';

export default class Container extends LightningElement {
    @track eventReceived = false;
    @track customEventReceived = false;

    handleEvent() {
        this.eventReceived = true;
    }
    handleCustomEvent() {
        this.customEventReceived = true;
    }
}
