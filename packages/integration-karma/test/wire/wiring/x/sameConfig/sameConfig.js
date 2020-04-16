import { LightningElement, api, wire } from 'lwc';
import { EchoWireAdapter } from 'x/echoAdapter';

export default class SameConfig extends LightningElement {
    @api a;
    @api b;

    @api get result() {
        return this._result;
    }

    get sum() {
        return (parseInt(this.a) || 0) + (parseInt(this.b) || 0);
    }

    @wire(EchoWireAdapter, { sum: '$sum', static: 1, staticComplexParam: ['a', 'b'] })
    setResult(config) {
        this._result = config.sum;
    }
}
