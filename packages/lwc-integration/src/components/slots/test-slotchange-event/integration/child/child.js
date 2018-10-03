import { api, LightningElement } from 'lwc';

export default class Child extends LightningElement {
    @api
    addEventListenerToSlot() {
        const slot = this.template.querySelector('.programmatic-listener');
        slot.addEventListener('slotchange', event => {
            this.dispatchMessage(event);
        });
    }

    handleChange(event) {
        this.dispatchMessage(event);
    }

    dispatchMessage(event) {
        const elements = event.currentTarget.assignedNodes({ flatten: true });
        this.dispatchEvent(
            new CustomEvent('message', {
                bubbles: true,
                composed: true,
                detail: {
                    slotName: event.currentTarget.className,
                    assignedContents: elements.map(el => el.textContent),
                },
            })
        );
    }
}
