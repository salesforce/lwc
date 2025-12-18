import { LightningElement } from 'lwc';

export default class extends LightningElement {
    connectedCallback() {
        // Modify a class that has already been set by the parent
        this.classList.add('connected-callback-class');
        this.classList.add('connected-callback-class-2');
    }
}
