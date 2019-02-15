import { LightningElement } from "lwc";
import { EVENT } from '../EVENT';

export default class Child extends LightningElement {
    log(guid) {
        this.dispatchEvent(new CustomEvent('log', {
            bubbles: true,
            composed: true,
            detail: { guid },
        }));
    }

    constructor() {
        super();

        // Custom element
        this.addEventListener('slottedbuttonclick', () => {
            this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD);
        });
        this.addEventListener('childbuttonclick', () => {
            this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD);
        });

        // Shadow root
        this.template.addEventListener('slottedbuttonclick', () => {
            this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD_ROOT);
        });
        this.template.addEventListener('childbuttonclick', () => {
            this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD_ROOT);
        });
    }

    renderedCallback() {
        if (!this.rendered) {
            this.rendered = true;

            // Custom element
            this.addEventListener('slottedbuttonclick', () => {
                this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD);
            });
            this.addEventListener('childbuttonclick', () => {
                this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD);
            });

            // Shadow root
            this.template.addEventListener('slottedbuttonclick', () => {
                this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD_ROOT);
            });
            this.template.addEventListener('childbuttonclick', () => {
                this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD_ROOT);
            });

            // Button
            this.template.querySelector('button.child').addEventListener('childbuttonclick', () => {
                this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD_BUTTON);
            });

            // Slot
            const slot = this.template.querySelector('slot');
            if (slot) {
                slot.addEventListener('slottedbuttonclick', () => {
                    this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_SLOT);
                });
            }
        }
    }

    handleChildButtonClick() {
        this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_TEMPLATE_LISTENER__BOUND_TO_CHILD_BUTTON);
    }

    handleClick(event) {
        event.target.dispatchEvent(
            new CustomEvent('childbuttonclick', {
                bubbles: true,
                composed: true,
            })
        );
    }
}
