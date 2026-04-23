import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api error = null;

    connectedCallback() {
        try {
            this.template.host.attachShadow({ mode: 'open' });
        } catch (error) {
            this.error = error;
        }
    }
}
