import { LightningElement, track } from 'lwc';

export default class FocusOutComposedTrue extends LightningElement {
    @track eventIsComposed = false;
    @track customEventNotComposed = false;

    // Receives native focusout event
    handleFocusOut(evt) {
        this.eventIsComposed = evt.composed;
    }

    // Receives custom native focusout event
    handleCustomFocusOut(evt) {
        this.customEventNotComposed = evt.composed === false;
    }

    handleButtonClick() {
        this.template
            .querySelector('.custom-focus-out')
            .dispatchEvent(new CustomEvent('focusout', { bubbles: true, composed: false }));
    }
}
