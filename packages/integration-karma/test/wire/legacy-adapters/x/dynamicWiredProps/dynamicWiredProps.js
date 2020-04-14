import { LightningElement, wire, api } from 'lwc';
import { EchoWireAdapter } from 'x/echoWireAdapter';

export default class DynamicWiredProps extends LightningElement {
    _allUndefinedConfigCalls = [];
    _someDefinedConfigCalls = [];
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

    @api get allUndefinedConfigCalls() {
        return this._allUndefinedConfigCalls;
    }

    @api get someDefinedConfigCalls() {
        return this._someDefinedConfigCalls;
    }

    @api
    setParam(param, value) {
        this[param] = value;
    }
}
