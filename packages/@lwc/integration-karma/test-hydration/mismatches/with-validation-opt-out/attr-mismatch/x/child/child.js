import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    @api foo;
    static validationOptOut = true;

    connectedCallback() {
        this.setAttribute('foo', 'something else');
    }
}
