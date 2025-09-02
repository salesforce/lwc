import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api signal;

    foo = 'default';

    signalUnsubscribe = () => {};

    connectedCallback() {
        this.signalUnsubscribe = this.signal.subscribe(() => this.updateOnSignalNotification());
    }

    disconnectedCallback() {
        this.signalUnsubscribe();
    }

    updateOnSignalNotification() {
        this.foo = this.signal.value;
    }
}
