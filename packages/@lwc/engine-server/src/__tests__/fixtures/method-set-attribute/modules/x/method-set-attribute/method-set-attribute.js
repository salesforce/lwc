import { LightningElement } from 'lwc';

export default class MethodSetAttribute extends LightningElement {
    connectedCallback() {
        this.setAttribute('data-null', null);
        this.setAttribute('data-boolean', true);
        this.setAttribute('data-number', 1);
        this.setAttribute('data-string', 'test');
        this.setAttribute('data-empty-string', '');

        this.setAttribute('data-override', 'original')
        this.setAttribute('data-override', 'override');
    }
}