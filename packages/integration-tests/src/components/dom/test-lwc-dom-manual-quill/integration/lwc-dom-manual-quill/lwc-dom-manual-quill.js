import { LightningElement, track } from 'lwc';

export default class LwcDomManualQuill extends LightningElement {
    @track errorMessage = '';
    handleClick() {
        const timeout = setTimeout(() => {
            this.errorMessage = 'No error';
        }, 0);
        window.onerror = (errMessage) => {
            window.clearTimeout(timeout);
            this.errorMessage = errMessage;
        }



        const div = document.createElement('div');
        div.innerHTML = '<span>span</span>';
        const span = div.querySelector('span');
        this.template.querySelector('.manual').appendChild(div);
        span.textContent = '';
        span.parentNode.removeChild(span);
    }
}
