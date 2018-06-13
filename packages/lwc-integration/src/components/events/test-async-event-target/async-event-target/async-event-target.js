import { Element, unwrap, track } from 'engine';


export default class AsyncEventTarget extends Element {
    @track syncTargetIsCorrect = false;
    @track asyncTargetIsCorrect = false;

    handleClick(evt) {
        this.syncTargetIsCorrect = evt.target === this.template.querySelector('x-child');
        setTimeout(() => {
            this.asyncTargetIsCorrect = evt.target.tagName === 'ASYNC-EVENT-TARGET';
        }, 10);
    }
}
