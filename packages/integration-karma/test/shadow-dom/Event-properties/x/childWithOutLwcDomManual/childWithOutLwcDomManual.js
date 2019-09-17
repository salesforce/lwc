import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    renderedCallback() {
        const container = this.template.querySelector('div');
        container.appendChild(document.createElement('span'));
    }
}
