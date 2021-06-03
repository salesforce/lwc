import { LightningElement } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';
    get hasShadowRoot() {
        return this.shadowRoot !== null && this.shadowRoot === this.template;
    }
}
