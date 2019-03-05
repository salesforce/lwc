import { LightningElement, track } from 'lwc';

export default class Child extends LightningElement {
    @track eventTargetIsCorrect = false;

    connectedCallback() {
        this.template.addEventListener('click', evt => {
            this.eventTargetIsCorrect = evt.target.tagName === 'INTEGRATION-GRAND-CHILD';
        });
    }
}
