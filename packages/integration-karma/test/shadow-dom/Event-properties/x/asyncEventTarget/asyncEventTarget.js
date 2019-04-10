import { LightningElement, api } from 'lwc';

export default class AsyncEventTarget extends LightningElement {
    @api syncTargetIsCorrect = false;
    @api asyncTargetIsCorrect = false;

    handleClick(evt) {
        this.syncTargetIsCorrect = evt.target === this.template.querySelector('x-child');
        setTimeout(() => {
            this.asyncTargetIsCorrect = evt.target.tagName === 'X-ASYNC-EVENT-TARGET';
        }, 0);
    }
}
