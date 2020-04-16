import { LightningElement, track } from 'lwc';

export default class Container extends LightningElement {
    @track eventTargetIsCorrect = false;

    connectedCallback() {
        this.template.addEventListener('click', (evt) => {
            this.eventTargetIsCorrect = evt.target.tagName === 'X-CHILD';
        });
    }
}
