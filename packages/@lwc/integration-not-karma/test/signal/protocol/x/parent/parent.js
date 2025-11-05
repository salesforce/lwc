import { LightningElement, api } from 'lwc';
import { Signal } from 'x/signal';

export default class extends LightningElement {
    signal = new Signal('initial value');

    @api showChild = false;
    @api renderCount = 0;

    renderedCallback() {
        this.renderCount++;
    }

    @api
    getSignalSubscriberCount() {
        return this.signal.getSubscriberCount();
    }

    @api
    getSignalRemovedSubscriberCount() {
        return this.signal.getRemovedSubscriberCount();
    }

    @api
    updateSignalValue() {
        this.signal.value = 'updated value';
    }
}
