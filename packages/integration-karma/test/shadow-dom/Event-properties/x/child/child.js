import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    renderedCallback() {
        const div = this.template.querySelector('div');
        const span = document.createElement('span');
        span.className = 'manually-appended-in-rendered-callback';
        div.appendChild(span);
    }
}
