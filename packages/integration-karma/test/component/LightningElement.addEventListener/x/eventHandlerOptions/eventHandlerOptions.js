import { LightningElement } from 'lwc';

export default class Test extends LightningElement {
    connectedCallback() {
        this.addEventListener('click', () => {}, {
            once: true,
        });
    }
}
