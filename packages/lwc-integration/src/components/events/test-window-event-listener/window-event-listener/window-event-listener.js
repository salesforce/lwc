import { Element, track } from 'engine';

export default class WindowEventListener extends Element {
    @track windowEventTargetTagName = '';
    connectedCallback() {
        window.addEventListener('click', (evt) => {
            this.windowEventTargetTagName = evt.target.tagName.toLowerCase();
        });
    }
    handleClick() {
        // empty handler
    }
}
