import { LightningElement, track } from 'lwc';

export default class SyncNodeRemoval extends LightningElement {
    @track errorMessage;
    handleClick() {
        const timeout = window.setTimeout(() => {
            this.errorMessage = 'No error';
        }, 200);
        window.onerror = (errorMessage) => {
            window.clearTimeout(timeout);
            this.errorMessage = errorMessage;
        }

        const elm = this.template.querySelector('.dom');
        const div = document.createElement('div');
        const b = document.createElement('span');
        div.appendChild(b);
        b.textContent = 'asd';
        elm.appendChild(div);
        b.textContent = 'hello'
    }
}
