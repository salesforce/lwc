import { LightningElement, api, track } from 'lwc';
import { Signal } from 'x/signal';

const signal = new Signal('initial value');

export default class extends LightningElement {
    @api showApiSignal = false;
    @api showGetterSignal = false;
    @api showGetterSignalValue = false;
    @api showTrackedSignal = false;
    @api showObservedFieldSignal = false;
    @api showOnlyUsingSignalNotValue = false;

    @api apiSignal = signal;
    @track trackSignal = signal;

    observedFieldSignal = signal;

    get getterSignalField() {
        // this works because the signal is bound to the LWC
        return this.observedFieldSignal;
    }

    get getterSignalFieldValue() {
        return this.observedFieldSignal.value;
    }

    @api
    getSignalSubscriberCount() {
        return signal.getSubscriberCount();
    }
}
