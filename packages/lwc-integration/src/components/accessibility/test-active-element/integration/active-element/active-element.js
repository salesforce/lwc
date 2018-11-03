import { LightningElement } from 'lwc';

export default class ActiveElement extends LightningElement {
    connectedCallback() {
        const outside = document.createElement('input');
        outside.type = 'range';
        outside.classList.add('outside-input');
        document.body.appendChild(outside);
    }
}
