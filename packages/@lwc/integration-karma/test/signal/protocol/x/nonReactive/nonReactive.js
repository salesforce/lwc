import { LightningElement, api, track } from 'lwc';
import { Signal } from 'x/signal';

const signal = new Signal('initial value');

export default class extends LightningElement {
    // Note that this signal is bound but it's never referenced on the template
    _signal = signal;
    @api apiSignalValue = signal.value;
    @track trackSignalValue = signal.value;
    observedFieldExternalSignalValue = signal.value;
    observedFieldBoundSignalValue = this._signal.value;

    get externalSignalValueGetter() {
        return signal.value;
    }

    @api
    getSignalSubscriberCount() {
        return signal.getSubscriberCount();
    }
}
