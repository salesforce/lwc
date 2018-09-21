import { api, track, LightningElement } from 'lwc';

export default class App extends LightningElement {
    @api
    addEventListenerToSlot() {
        const slot = this.template.querySelector('.nochange');
        slot.addEventListener('slotchange', () => {});
    }

    handleChange(event) {
        this.dispatchMessage(event);
    }
    handleChangeDefault(event) {
        this.dispatchMessage(event);
    }
    handleChangeNested(event) {
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
                    name: event.target.className,
                    elements: elements.map(el => el.textContent),
                },
            })
        );
    }
}