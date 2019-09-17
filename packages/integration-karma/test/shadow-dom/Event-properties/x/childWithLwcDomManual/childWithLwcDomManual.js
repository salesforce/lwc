import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    renderedCallback() {
        const portal = this.template.querySelector('div');
        portal.appendChild(document.createElement('span'));
    }
}
