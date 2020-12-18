import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    renderedCallback() {
        const div = this.template.querySelector('.container-for-manually-added-span');
        const span = document.createElement('span');
        div.appendChild(span);
    }
}
