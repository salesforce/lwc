import { LightningElement, unwrap, track } from "lwc";


export default class AsyncEventTarget extends LightningElement {
    @track syncTargetIsCorrect = false;
    @track asyncTargetIsCorrect = false;

    handleClick(evt) {
        this.syncTargetIsCorrect = evt.target === this.template.querySelector('x-child');
        setTimeout(() => {
            this.asyncTargetIsCorrect = evt.target.tagName === 'ASYNC-EVENT-TARGET';
        }, 10);
    }
}
