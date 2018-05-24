import { Element } from 'engine';
import EVENT from '../EVENT';

export default class Child extends Element {
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
        this.addEventListener('slottedbuttonclick', event => {
            this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD);
        });
        this.addEventListener('childbuttonclick', event => {
            this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD);
        });

        // Shadow root
        this.template.addEventListener('slottedbuttonclick', event => {
            this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD_ROOT);
        });
        this.template.addEventListener('childbuttonclick', event => {
            this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD_ROOT);
        });
    }

    renderedCallback() {
        if (!this.rendered) {
            this.rendered = true;

            // Custom element
            this.addEventListener('slottedbuttonclick', event => {
                this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD);
            });
            this.addEventListener('childbuttonclick', event => {
                this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD);
            });

            // Shadow root
            this.template.addEventListener('slottedbuttonclick', event => {
                this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD_ROOT);
            });
            this.template.addEventListener('childbuttonclick', event => {
                this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD_ROOT);
            });

            // Button
            this.template.querySelector('button#child').addEventListener('childbuttonclick', event => {
                this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD_BUTTON);
            });
        }
    }

    handleChildButtonClick(event) {
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
