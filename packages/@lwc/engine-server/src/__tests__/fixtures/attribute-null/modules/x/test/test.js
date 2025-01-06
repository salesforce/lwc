import { LightningElement } from 'lwc';

export default class extends LightningElement {
    connectedCallback() {
        this.setAttribute('data-foo', 'foo');
        this.setAttribute('data-foo', null);
        this.setAttribute('data-bar', null);
    }
}
