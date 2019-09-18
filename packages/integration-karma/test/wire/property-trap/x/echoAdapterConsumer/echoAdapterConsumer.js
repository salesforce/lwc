import { LightningElement, wire, api, track } from 'lwc';
import { EchoWireAdapter } from 'x/echoAdapter';

export default class EchoAdapterConsumer extends LightningElement {
    @api recordId = 'default value';
    @wire(EchoWireAdapter, {
        recordId: '$recordId',
        keyVal: '$a.b.c.d',
        getterValue: '$getterValue',
        expandoValue: '$expando',
    })
    wiredProp;

    @track trackedProp;

    a = {};
    mutatedGetterValue = '';

    @api
    getWiredProp() {
        return this.wiredProp;
    }

    @api
    setWireKeyParameter(newValue) {
        this.a = newValue;
    }

    @api
    setTrackedPropAndWireKeyParameter(newValue) {
        this.trackedProp = Math.random();
        this.a = newValue;
    }

    @api
    setMutatedGetterValue(newValue) {
        this.mutatedGetterValue = newValue;
    }

    @api
    setExpandoValue(newValue) {
        this.expando = newValue;
    }

    get getterValue() {
        return 'getterValue' + this.mutatedGetterValue;
    }
}
