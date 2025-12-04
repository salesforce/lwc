import { LightningElement, wire, api } from 'lwc';
import { EchoWireAdapter } from 'x/echoWireAdapter';

export default class SameConfigCase extends LightningElement {
    @api a;
    @api b;

    get sum() {
        return (parseInt(this.a) || 0) + (parseInt(this.b) || 0);
    }

    @wire(EchoWireAdapter, { sum: '$sum', static: 1, staticComplexParam: ['a', 'b'] })
    _resultMultipleDependenciesForConfig;

    @wire(EchoWireAdapter, { a: '$a' })
    _resultApiValueDependency;

    @api get resultMultipleDependenciesForConfig() {
        return this._resultMultipleDependenciesForConfig;
    }

    @api get resultApiValueDependency() {
        return this._resultApiValueDependency;
    }
}
