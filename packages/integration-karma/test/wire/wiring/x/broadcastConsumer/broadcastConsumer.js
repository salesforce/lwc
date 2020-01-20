import { LightningElement, wire, api } from 'lwc';
import { BroadcastAdapter } from 'x/broadcastAdapter';
import { EchoWireAdapter } from 'x/echoAdapter';

export default class BroadcastConsumer extends LightningElement {
    @wire(BroadcastAdapter) wiredProp;

    @wire(BroadcastAdapter)
    setWirePropertyInMethod(data) {
        this.methodArgument = data;
    }

    commonParameter;

    @wire(EchoWireAdapter, { id: 'echoWire1', common: '$commonParameter' }) echoWiredProp1;
    @wire(EchoWireAdapter, { id: 'echoWire2', common: '$commonParameter' }) echoWiredProp2;

    @api
    getEchoWiredProp1() {
        return this.echoWiredProp1;
    }

    @api
    getEchoWiredProp2() {
        return this.echoWiredProp2;
    }

    @api
    setCommonParameter(value) {
        this.commonParameter = value;
    }

    @api
    getWiredProp() {
        return this.wiredProp;
    }

    @api
    getWiredMethodArgument() {
        return this.methodArgument;
    }

    @api
    setWiredPropData(newValue) {
        this.wiredProp.data = newValue;
    }

    get WiredPropValue() {
        const propValue = this.wiredProp || '';

        if (propValue.data) {
            return propValue.data;
        }

        return propValue;
    }
}
