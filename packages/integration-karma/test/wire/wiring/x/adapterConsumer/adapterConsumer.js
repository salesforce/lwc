import { LightningElement, wire, api } from 'lwc';
import { EchoWireAdapter } from 'x/echoAdapter';

export default class AdapterConsumer extends LightningElement {
    renderId;
    simpleParam;
    @wire(EchoWireAdapter, { simpleParam: '$simpleParam', staticParam: [1, 2, 3] }) wireConnected;

    @api
    getWiredProp() {
        return this.wireConnected;
    }

    @api
    setDynamicParamSource(newValue) {
        this.simpleParam = newValue;
    }

    @api
    forceRerender() {
        this.renderId = Math.random() + Math.random();
    }

    get staticParamValue() {
        return this.wireConnected.staticParam && this.wireConnected.staticParam.join(',');
    }

    get simpleParamValue() {
        return this.wireConnected.simpleParam;
    }
}
