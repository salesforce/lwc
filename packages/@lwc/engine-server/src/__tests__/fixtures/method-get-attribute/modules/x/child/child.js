import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    get dataAttr() {
        return String(this.getAttribute('data-attr'));
    }
}