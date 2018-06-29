import { Element, track } from 'engine';

export default class AsyncEventCurrentTarget extends Element {
    @track currentTargetIsNull = false;
    handleClick(evt) {
        setTimeout(() => {
            this.currentTargetIsNull = evt.currentTarget === null;
        }, 10);
    }
}
