import { LightningElement, track } from 'lwc';

export default class AsyncEventCurrentTarget extends LightningElement {
    @track currentTargetIsNull = false;
    handleClick(evt) {
        setTimeout(() => {
            this.currentTargetIsNull = evt.currentTarget === null;
        }, 0);
    }
}
