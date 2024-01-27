import { LightningElement, api, track } from 'lwc';
import { Signal } from 'x/signal';

const signal = new Signal('initial value');

export default class extends LightningElement {
    // Note that this signal is bound but it's never referenced on the template
    _signal = signal;
    @api apiSignalValue = signal.value;
    @track trackSignalValue = signal.value;
    observedFieldExternalSignalValue = signal.value;
    // Note in the tests we use createElement outside of the LWC engine and therefore no template is
    // actively rendering which is why this does not get automatically registered.
    observedFieldBoundSignalValue = this._signal.value;

    get externalSignalValueGetter() {
        // Note that the value of the signal is not bound to the class and will therefore not be
        // automatically subscribed to the re-render.
        return signal.value;
    }

    @api
    getSignalSubscriberCount() {
        return signal.getSubscriberCount();
    }
}
