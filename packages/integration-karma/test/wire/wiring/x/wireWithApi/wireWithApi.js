import { LightningElement, api, wire } from 'lwc';
import { EchoWireAdapter } from 'x/echoAdapter';

export default class WireWithApi extends LightningElement {
    @api a;

    @api get result() {
        return this._result;
    }

    @wire(EchoWireAdapter, { valueFromApi: '$a' })
    setResult(config) {
        this._result = config.valueFromApi;
    }
}
