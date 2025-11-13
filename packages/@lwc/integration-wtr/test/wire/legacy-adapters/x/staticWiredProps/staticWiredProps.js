import { LightningElement, wire, api } from 'lwc';
import { EchoWireAdapter } from 'x/echoWireAdapter';

export default class StaticWiredProps extends LightningElement {
    emptyObject = [];
    emptyConfig = [];
    allUndefinedPropsInConfig = [];
    someUndefinedPropsInConfig = [];

    @wire(EchoWireAdapter, {})
    emptyObjectConfig(providedValue) {
        this.emptyObject.push(providedValue);
    }

    @wire(EchoWireAdapter)
    emptyConfigWire(providedValue) {
        this.emptyConfig.push(providedValue);
    }

    @wire(EchoWireAdapter, { p1: undefined, p2: undefined })
    allUndefinedProps(providedValue) {
        this.allUndefinedPropsInConfig.push(providedValue);
    }

    @wire(EchoWireAdapter, { p1: 'test', p2: undefined })
    someUndefinedProps(providedValue) {
        this.someUndefinedPropsInConfig.push(providedValue);
    }

    @api get emptyObjectConfigCalls() {
        return this.emptyObject;
    }

    @api get emptyConfigCalls() {
        return this.emptyConfig;
    }

    @api get allUndefinedPropsInConfigCalls() {
        return this.allUndefinedPropsInConfig;
    }

    @api get someUndefinedPropsInConfigCalls() {
        return this.someUndefinedPropsInConfig;
    }
}
