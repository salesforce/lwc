import { LightningElement, wire, api } from 'lwc';
import { EchoWireAdapter } from 'x/echoWireAdapter';

export default class DynamicWiredProps extends LightningElement {
    _allUndefinedConfigCalls = [];
    _someDefinedConfigCalls = [];
    _mixedAllParamsUndefinedCalls = [];
    p1;
    p2;
    p3 = 'test';

    @wire(EchoWireAdapter, { p1: '$p1', p2: '$p2' })
    allUndefinedConfig(providedValue) {
        this._allUndefinedConfigCalls.push(providedValue);
    }

    @wire(EchoWireAdapter, { p1: '$p1', p3: '$p3' })
    someDefinedConfig(providedValue) {
        this._someDefinedConfigCalls.push(providedValue);
    }

    @wire(EchoWireAdapter, { p1: '$p1', p3: '$p2', staticParam: ['test'] })
    mixedAllParamsUndefined(providedValue) {
        this._mixedAllParamsUndefinedCalls.push(providedValue);
    }

    @api get allUndefinedConfigCalls() {
        return this._allUndefinedConfigCalls;
    }

    @api get someDefinedConfigCalls() {
        return this._someDefinedConfigCalls;
    }

    @api get mixedAllParamsUndefinedCalls() {
        return this._mixedAllParamsUndefinedCalls;
    }

    @api
    setParam(param, value) {
        this[param] = value;
    }
}
