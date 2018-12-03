import { LightningElement } from 'lwc';

export default class SyncNodeRemoval extends LightningElement {
    handleClick() {
        const elm = this.template.querySelector('.dom');
        const div = document.createElement('div');
        const b = document.createElement('span');
        div.appendChild(b);
        b.textContent = 'asd';
        elm.appendChild(div);
        b.textContent = 'hello'
    }
}
