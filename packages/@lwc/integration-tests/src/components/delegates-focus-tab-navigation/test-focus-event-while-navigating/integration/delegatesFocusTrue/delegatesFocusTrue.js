import { LightningElement } from 'lwc';

export default class DelegatesFocusTrue extends LightningElement {
    static delegatesFocus = true;

    handleShadowFocus() {
        this.dispatchEvent(new CustomEvent('shadowfocus'));
    }
}
