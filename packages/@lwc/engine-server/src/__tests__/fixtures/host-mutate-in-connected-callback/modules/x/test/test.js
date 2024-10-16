import { LightningElement } from 'lwc';

export default class extends LightningElement {
    connectedCallback() {
        this.setAttribute('data-mutated-in-connected-callback', 'true')
    }
}
