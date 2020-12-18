import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    @api
    appendSpanAndReturn() {
        const div = this.template.querySelector('.container-for-manually-added-span');
        const span = document.createElement('span');
        return div.appendChild(span);
    }
}
