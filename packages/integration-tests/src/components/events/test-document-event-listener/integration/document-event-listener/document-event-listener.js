import { LightningElement, track } from 'lwc';

export default class WindowEventListener extends LightningElement {
    @track documentEventTargetTagName = '';
    connectedCallback() {
        document.addEventListener('click', evt => {
            this.documentEventTargetTagName = evt.target.tagName.toLowerCase();
        });
    }
    handleClick() {
        // empty handler
    }
}
