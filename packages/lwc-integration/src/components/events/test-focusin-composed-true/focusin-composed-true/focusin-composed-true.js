import { Element, track } from 'engine';

export default class FocusInComposedTrue extends Element {
    @track eventIsComposed = false;
    @track customEventNotComposed = false;

    // Receives native focusin event
    handleFocusIn(evt) {
        this.eventIsComposed = evt.composed;
    }

    // Receives custom native focusin event
    handleCustomFocusIn(evt) {
        this.customEventNotComposed = evt.composed === false;
    }

    handleButtonClick() {
        this.template.querySelector('.custom-focus-in').dispatchEvent(new CustomEvent('focusin', { bubbles: true, composed: false }));
    }
}
