import { Element, api, track, unwrap } from 'engine';
import EVENT from '../EVENT';

const GUID_TO_EVENT_NAME_MAP = Object.keys(EVENT).reduce((map, key) => {
    map[EVENT[key]] = key;
    return map;
}, {});

export default class EventFlow extends Element {
    // Expose these "constants" to the test suite
    @api get EVENT() {
        return EVENT;
    }

    @track _logs = [];
    @api get logs() {
        return this._logs;
    }
    log(guid) {
        if (!guid || !GUID_TO_EVENT_NAME_MAP[guid]) {
            throw new Event(`The guid "${guid}" does not exist.`);
        }
        this._logs.push({
            guid,
            eventName: GUID_TO_EVENT_NAME_MAP[guid],
        });
    }

    connectedCallback() {
        this.template.addEventListener('log', event => {
            this.log(unwrap(event).detail.guid);
        });
    }

    renderedCallback() {
        if (!this.rendered) {
            this.rendered = true;

            this.addEventListener('slottedbuttonclick', event => {
                this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW);
            });
            this.addEventListener('childbuttonclick', event => {
                this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW);
            });

            this.template.addEventListener('slottedbuttonclick', event => {
                this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW_ROOT);
            });
            this.template.addEventListener('childbuttonclick', event => {
                this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW_ROOT);
            });

            this.template.querySelector('x-parent').addEventListener('slottedbuttonclick', event => {
                this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT);
            });
            this.template.querySelector('x-parent').addEventListener('childbuttonclick', event => {
                this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT);
            });
        }
    }

    handleSlottedButtonClick(event) {
        this.log(EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_TEMPLATE_LISTENER__BOUND_TO_PARENT);
    }

    handleChildButtonClick(event) {
        this.log(EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_TEMPLATE_LISTENER__BOUND_TO_PARENT);
    }
}
