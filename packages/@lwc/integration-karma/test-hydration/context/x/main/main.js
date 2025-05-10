import { LightningElement, api } from 'lwc';
export default class Root extends LightningElement {
    @api showTree = false;

    connectedCallback() {
        this.showTree = true;
    }
}
