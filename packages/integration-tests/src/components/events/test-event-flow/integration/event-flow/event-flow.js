import { LightningElement, api, track, unwrap } from "lwc";
import { EVENT, GUID_TO_NAME_MAP } from '../EVENT';

export default class EventFlow extends LightningElement {
    // Expose these "constants" to the test suite
    @api get EVENT() {
        return {
            EVENT,
            GUID_TO_NAME_MAP,
        };
    }

    @track _logs = [];
    @api get logs() {
        return unwrap(this._logs);
    }
    log(guid) {
        if (!guid || !GUID_TO_NAME_MAP[guid]) {
            throw new Event(`The guid "${guid}" does not exist.`);
        }
        this._logs.push({
            guid,
            eventName: GUID_TO_NAME_MAP[guid],
        });
    }

    connectedCallback() {
        this.template.addEventListener('log', event => {
            this.log(event.detail.guid);
        });
    }

    renderedCallback() {
        if (!this.rendered) {
            this.rendered = true;

            this.addEventListener('slottedbuttonclick', () => {
                this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW);
            });
            this.addEventListener('childbuttonclick', () => {
                this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW);
            });

            this.template.addEventListener('slottedbuttonclick', () => {
                this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW_ROOT);
            });
            this.template.addEventListener('childbuttonclick', () => {
                this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW_ROOT);
            });

            this.template.querySelector('integration-parent').addEventListener('slottedbuttonclick', () => {
                this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT);
            });
            this.template.querySelector('integration-parent').addEventListener('childbuttonclick', () => {
                this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT);
            });
        }
    }

    handleSlottedButtonClick() {
        this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_TEMPLATE_LISTENER__BOUND_TO_PARENT);
    }

    handleChildButtonClick() {
        this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_TEMPLATE_LISTENER__BOUND_TO_PARENT);
    }

    handleClearButtonClick() {
        this._logs.length = 0;
    }
}
