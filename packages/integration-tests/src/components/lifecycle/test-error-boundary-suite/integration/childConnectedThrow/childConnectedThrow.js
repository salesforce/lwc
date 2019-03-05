import { LightningElement } from 'lwc';

export default class ChildConnectedThrow extends LightningElement {
    connectedCallback() {
        throw new Error('Child threw in connectedCallback');
    }
}
