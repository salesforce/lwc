import { LightningElement } from 'lwc';

export default class Test extends LightningElement {
    renderedCallback() {
        const div = this.template.querySelector('div');
        div.appendChild(document.createElement('span'));
    }
}