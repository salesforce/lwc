import { LightningElement } from 'lwc';

export default class LifecycleChild extends LightningElement {
    connectedCallback() {
        this.dispatchEvent(new CustomEvent('test'));
    }
}
