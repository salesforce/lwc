import { Element, track } from 'engine';

export default class ComposedEvents extends Element {
    @track eventReceived = false;
    @track customEventReceived = false;

    handleEvent() {
        this.eventReceived = true;
    }
    handleCustomEvent() {
        this.customEventReceived = true;
    }
}
