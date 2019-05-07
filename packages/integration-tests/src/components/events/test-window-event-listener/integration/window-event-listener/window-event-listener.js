import { LightningElement, track } from 'lwc';

export default class WindowEventListener extends LightningElement {
    @track windowEventTargetTagName = '';
    connectedCallback() {
        window.addEventListener('click', evt => {
            this.windowEventTargetTagName = evt.target.tagName.toLowerCase();
        });
    }
    handleClick() {
        // empty handler
    }
}
