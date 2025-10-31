import { LightningElement } from 'lwc';

export default class Shadow extends LightningElement {
    connectedCallback() {
        this.template.host.appendChild(document.createElement('div'));
    }
}
