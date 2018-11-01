import { LightningElement, track } from 'lwc';

export default class EventListenerOnAncestorCurrentTarget extends LightningElement {
    @track eventTargetTagName;
    connectedCallback() {
        document.body.addEventListener('click', (e) => {
            try {
                this.eventTargetTagName = e.target.tagName;
            } catch (e) {
                this.eventTargetTagName = e.message;
            }
        })
    }
    handleClick(e) {

    }
}
