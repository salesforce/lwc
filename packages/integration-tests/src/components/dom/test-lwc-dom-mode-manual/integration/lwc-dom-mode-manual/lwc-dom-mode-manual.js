import { LightningElement } from 'lwc';

export default class Manual extends LightningElement {
    renderedCallback() {
        const div = document.createElement('div');
        div.textContent = 'Manual';
        this.template.querySelector('.manual').appendChild(div);
    }
}
