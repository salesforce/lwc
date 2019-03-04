import { LightningElement, track } from 'lwc';

export default class AsyncEventTarget extends LightningElement {
    @track syncTargetIsCorrect = false;
    @track asyncTargetIsCorrect = false;

    handleClick(evt) {
        this.syncTargetIsCorrect = evt.target === this.template.querySelector('integration-child');
        setTimeout(() => {
            this.asyncTargetIsCorrect = evt.target.tagName === 'INTEGRATION-ASYNC-EVENT-TARGET';
        }, 0);
    }
}
