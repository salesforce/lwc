import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    renderedCallbackCalls = 0;
    slotChangeEventCalls = {
        defaultCalledTimes: 0,
        namedCalledTimes: 0,
    };

    @api
    getRenderedTimes() {
        return this.renderedCallbackCalls;
    }

    @api
    getSlotChangeEventCalls() {
        return this.slotChangeEventCalls;
    }

    handleDefaultSlotChangeEvent() {
        this.slotChangeEventCalls.defaultCalledTimes++;
    }

    handleNamedSlotChangeEvent() {
        this.slotChangeEventCalls.namedCalledTimes++;
    }

    renderedCallback() {
        this.renderedCallbackCalls++;
    }
}
