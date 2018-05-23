import { Element, track } from 'engine';

export default class Child extends Element {
    @track eventTargetIsCorrect = false;

    connectedCallback() {
        this.template.addEventListener('click', (evt) => {
            console.log(evt.target.tagName)
            this.eventTargetIsCorrect = evt.target.tagName === 'X-GRAND-CHILD';
        });
    }
}
