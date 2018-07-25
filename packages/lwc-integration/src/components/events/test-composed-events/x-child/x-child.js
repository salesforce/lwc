import { Element, api } from 'engine';

export default class Child extends Element {
    handleEventClick(event) {
        event.target.dispatchEvent(
            new Event('event', {
                bubbles: true,
                composed: true,
            })
        );
    }
    handleCustomEventClick(event) {
        event.target.dispatchEvent(
            new CustomEvent('customevent', {
                bubbles: true,
                composed: true,
            })
        );
    }
}
