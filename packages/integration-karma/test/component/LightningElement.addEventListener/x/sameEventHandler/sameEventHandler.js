import { LightningElement } from 'lwc';

const handler = () => {};

export default class SameEventHandler extends LightningElement {
    connectedCallback() {
        this.addEventListener('click', handler);
        this.addEventListener('click', handler);
    }
}
