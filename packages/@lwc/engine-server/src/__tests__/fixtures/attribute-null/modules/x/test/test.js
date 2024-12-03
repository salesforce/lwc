import { LightningElement } from 'lwc';

export default class extends LightningElement {
    connectedCallback() {
        this.setAttribute('data-foo', 'foo');
        this.setAttribute('data-foo', null);
        this.setAttribute('data-bar', null);

        this.setAttribute('aria-label', 'awesome label');
        this.ariaLabel = null;
        this.setAttribute('aria-description', 'awesome description');
        this.ariaDescription = undefined;
    }
}
