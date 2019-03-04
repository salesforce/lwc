import { LightningElement } from 'lwc';
import { EVENT } from '../EVENT';

export default class Parent extends LightningElement {
    log(guid) {
        this.dispatchEvent(
            new CustomEvent('log', {
                bubbles: true,
                composed: true,
                detail: { guid },
            })
        );
    }

    constructor() {
        super();

        // Custom element
        this.addEventListener('slottedbuttonclick', () => {
            this.log(
                EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT
            );
        });
        this.addEventListener('childbuttonclick', () => {
            this.log(
                EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT
            );
        });

        // Shadow root
        this.template.addEventListener('slottedbuttonclick', () => {
            this.log(
                EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT_ROOT
            );
        });
        this.template.addEventListener('childbuttonclick', () => {
            this.log(
                EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT_ROOT
            );
        });
    }

    renderedCallback() {
        if (!this.rendered) {
            this.rendered = true;

            // Custom element
            this.addEventListener('slottedbuttonclick', () => {
                this.log(
                    EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT
                );
            });
            this.addEventListener('childbuttonclick', () => {
                this.log(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT
                );
            });

            // Shadow root
            this.template.addEventListener('slottedbuttonclick', () => {
                this.log(
                    EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT_ROOT
                );
            });
            this.template.addEventListener('childbuttonclick', () => {
                this.log(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT_ROOT
                );
            });

            // Child
            this.template
                .querySelector('integration-child')
                .addEventListener('slottedbuttonclick', () => {
                    this.log(
                        EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD
                    );
                });
            this.template
                .querySelector('integration-child')
                .addEventListener('childbuttonclick', () => {
                    this.log(
                        EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD
                    );
                });

            // Buttons
            this.template
                .querySelector('button.slotted')
                .addEventListener('slottedbuttonclick', () => {
                    this.log(
                        EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_SLOTTED_BUTTON
                    );
                });

            // Wrapping div
            this.template.querySelector('div').addEventListener('slottedbuttonclick', () => {
                this.log(
                    EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_DIV
                );
            });
            this.template.querySelector('div').addEventListener('childbuttonclick', () => {
                this.log(
                    EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_DIV
                );
            });
        }
    }

    handleSlottedButtonClickOnDiv() {
        this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_DIV);
    }
    handleChildButtonClickOnDiv() {
        this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_DIV);
    }
    handleSlottedButtonClickOnChild() {
        this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_CHILD);
    }
    handleChildButtonClickOnChild() {
        this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_CHILD);
    }
    handleSlottedButtonClickOnSlottedButton() {
        this.log(
            EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_SLOTTED_BUTTON
        );
    }

    handleSlottedClick(event) {
        event.target.dispatchEvent(
            new CustomEvent('slottedbuttonclick', {
                bubbles: true,
                composed: true,
            })
        );
    }
}
