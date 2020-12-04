import { LightningElement, wire } from 'lwc';
import { EchoWireAdapter } from 'x/echoAdapter';

export default class AdapterConsumerWithLifecycleEvents extends LightningElement {
    setByConnected;
    @wire(EchoWireAdapter, { value: '$setByConnected' }) wiredValue;

    connectedCallback() {
        this.dispatchEvent(new CustomEvent('connectedcallback'));
        this.setByConnected = true;
    }
}
