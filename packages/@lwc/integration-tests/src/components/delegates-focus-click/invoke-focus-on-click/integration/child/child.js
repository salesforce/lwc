import { LightningElement } from 'lwc';

export default class extends LightningElement {
    static delegatesFocus = true;

    handleFocus(event) {
        event.target.focus();
    }
}
