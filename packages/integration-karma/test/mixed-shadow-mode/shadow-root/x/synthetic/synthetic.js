import { LightningElement } from 'lwc';

export default class extends LightningElement {
    get hasShadowRoot() {
        return this.shadowRoot !== null && this.shadowRoot === this.template;
    }
}
