import { LightningElement } from 'lwc';

export default class MyComponent extends LightningElement {
    get tabIndex() {
        return this.getAttribute('tabindex');
    }

    set tabIndex(value) {
        this.setAttribute('tabindex', value);
    }
}
