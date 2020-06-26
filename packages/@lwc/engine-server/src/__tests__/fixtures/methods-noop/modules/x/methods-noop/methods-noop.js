import { LightningElement } from 'lwc';

export default class MethodsNoop extends LightningElement {
    connectedCallback() {
        expect(() => this.addEventListener('click', () => {})).not.toThrow();
        expect(() => this.removeEventListener('click', () => {})).not.toThrow();
    }
}