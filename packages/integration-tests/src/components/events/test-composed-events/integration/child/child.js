import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    handleEventClick(event) {
        event.target.dispatchEvent(
            new Event('event', {
                bubbles: true,
                composed: true,
            }),
        );
    }
    handleCustomEventClick(event) {
        event.target.dispatchEvent(
            new CustomEvent('customevent', {
                bubbles: true,
                composed: true,
            }),
        );
    }
}
