import { LightningElement } from 'lwc';

export default class DelegatesFocusFalse extends LightningElement {
    static delegatesFocus = false;

    handleShadowFocus() {
        this.dispatchEvent(new CustomEvent('shadowfocus'));
    }
}
