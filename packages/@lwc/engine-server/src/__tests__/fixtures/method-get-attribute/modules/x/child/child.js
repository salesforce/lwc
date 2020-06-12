import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    get dataAttr() {
        return this.getAttribute('data-attr');
    }
}