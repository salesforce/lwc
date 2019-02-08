import { LightningElement } from 'lwc';

export default class NonExistingEventListener extends LightningElement {
    connectedCallback() {
        this.removeEventListener('click', () => {});
    }
}
