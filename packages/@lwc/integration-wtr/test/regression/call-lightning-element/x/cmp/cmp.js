import { LightningElement } from 'lwc';

export default class Component extends LightningElement {
    static get delegatesFocus() {
        LightningElement.call(document.createElement('p'));
        return false;
    }
}
