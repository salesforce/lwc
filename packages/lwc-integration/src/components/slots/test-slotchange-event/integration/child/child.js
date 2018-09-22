import { api, LightningElement } from 'lwc';

export default class Child extends LightningElement {
    @api
    addEventListenerToSlot() {
        const slot = this.template.querySelector('.programmatic-listener');
        slot.addEventListener('slotchange', () => {});
    }

    handleChange(event) {
        this.dispatchMessage(event);
    }
    handleChangeNested(event) {
        // Ignore slotchange events that bubble up from below
        if (event.target !== event.currentTarget) {
            return;
        }
        this.dispatchMessage(event);
    }

    dispatchMessage(event) {
        const elements = event.target.assignedElements({ flatten: true });
        this.dispatchEvent(
            new CustomEvent('message', {
                bubbles: true,
                composed: true,
                detail: {
                    slotName: event.target.className,
                    assignedContents: elements.map(el => el.textContent),
                },
            })
        );
    }
}
