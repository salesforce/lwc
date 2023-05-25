import { LightningElement, wire, api } from 'lwc';
import { ContextAwareWireAdapter } from 'x/contextAwareAdapter';

export default class ContextAwareConsumer extends LightningElement {
    @wire(ContextAwareWireAdapter, {}) wireConnected;

    @api
    getWiredProp() {
        return this.wireConnected;
    }
}
